'use server';

import { ipRateLimiter, globalRateLimiter } from '@lib/ratelimit';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const MIN_SUBMISSION_TIME = 1000;
const resend = new Resend(process.env.RESEND_API_KEY);
type FormState = {
  error?: string;
  success?: boolean;
};

export async function sendEmail(
  prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const company = formData.get('company') as string;
    const formStart = formData.get('formStart') as string;
    const ip = (await headers()).get('x-forwarded-for') as string | null;

    if (!formStart) {
      return { error: 'Invalid submission.' };
    }

    const startTime = new Date(formStart).getTime();
    const now = Date.now();

    if (now - startTime < MIN_SUBMISSION_TIME || company) {
      return { success: true }; // Ignore bot submissions
    }

    if (name.length > 100) {
      return { error: 'Name cannot exceed 100 characters.' };
    }

    if (email.length > 150) {
      return { error: 'Email cannot exceed 150 characters.' };
    }

    if (message.length > 1000) {
      return { error: 'Message cannot exceed 1000 characters.' };
    }

    if (!name || !email || !message) {
      return { error: 'All fields are required.' };
    }

    if (ip) {
      const { success: ipSuccess } = await ipRateLimiter.limit(ip);
      if (!ipSuccess) {
        return {
          error:
            "Woah, slow down! You've submitted too many forms recently. Please try again later.",
        };
      }
    }

    const { success: globalSuccess } = await globalRateLimiter.limit('global');
    if (!globalSuccess) {
      return {
        error:
          'Oops, looks like my inbox is full with submissions for today! Please try again tomorrow.',
      };
    }

    await resend.emails.send({
      from: 'Contact | gabesantos.ca <noreply@gabesantos.ca>',
      to: process.env.TO_EMAIL || 'placeholder@example.com',
      subject: `Portfolio inquiry from ${name}`,
      replyTo: email,
      html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    });

    return { success: true };
  } catch {
    return { error: 'Something went wrong. Please try again later.' };
  }
}
