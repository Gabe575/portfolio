'use server';

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
