'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { escapeHtml } from '@lib/escape-html';
import {
  schedulerLoginLimiter,
  schedulerSubmissionLimiter,
  schedulerLinkLimiter,
} from '@lib/ratelimit';
import {
  endSession,
  passwordMatches,
  requesterIp,
  requireAdmin,
  startSession,
} from '@lib/scheduler/auth';
import { createRequest, deleteRequest, getPublicRequest, saveResponse } from '@lib/scheduler/store';
import { isScope, validTimezone, validateSlots } from '@lib/scheduler/time';

export type ActionState = { error?: string; success?: boolean; notificationFailed?: boolean };

export async function loginAdmin(_previous: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const input = formData.get('password');
    const { success } = await schedulerLoginLimiter.limit(await requesterIp());
    if (!success) return { error: 'Too many login attempts. Please try again in 15 minutes.' };
    if (typeof input !== 'string' || input.length > 1024 || !passwordMatches(input))
      return { error: 'Unable to sign in. Check your password and try again.' };
    await startSession();
  } catch {
    return { error: 'Sign-in is temporarily unavailable. Please try again.' };
  }
  redirect('/meet/admin');
}

export async function logoutAdmin(): Promise<void> {
  await requireAdmin();
  await endSession();
  redirect('/meet/admin/login');
}

export async function createAvailabilityRequest(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const title = formData.get('title');
    const timezone = formData.get('timezone');
    if (
      typeof title !== 'string' ||
      title.trim().length < 1 ||
      title.trim().length > 160 ||
      /[\u0000-\u001f\u007f]/.test(title)
    )
      return { error: 'Enter a meeting title between 1 and 160 characters.' };
    if (!validTimezone(timezone)) return { error: 'Choose a valid IANA timezone.' };
    id = (await createRequest(title.trim(), timezone)).id;
  } catch {
    return { error: 'The request could not be created. Please try again.' };
  }
  revalidatePath('/meet/admin');
  redirect(`/meet/admin/${id}`);
}

export async function removeAvailabilityRequest(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (formData.get('confirmed') !== 'yes') return { error: 'Confirm permanent deletion first.' };
  try {
    await deleteRequest(id);
  } catch {
    return { error: 'The request could not be deleted. Please try again.' };
  }
  revalidatePath('/meet/admin', 'layout');
  redirect('/meet/admin');
}

export async function submitAvailability(
  slug: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // Public writes resolve exclusively from the link credential, never an arbitrary ID.
    const request = await getPublicRequest(slug);
    if (!request) return { error: 'This availability link is no longer available.' };
    const ip = await requesterIp();
    const limits = await Promise.all([
      schedulerSubmissionLimiter.limit(ip),
      schedulerLinkLimiter.limit(slug),
    ]);
    if (limits.some((limit) => !limit.success))
      return { error: 'Too many submissions. Please try again in an hour.' };
    const timezone = formData.get('timezone');
    const scope = formData.get('scope');
    const raw = formData.get('slots');
    if (
      !validTimezone(timezone) ||
      !isScope(scope) ||
      typeof raw !== 'string' ||
      raw.length > 14000
    )
      return { error: 'Invalid availability. Please reload and try again.' };
    let availableSlots: string[];
    try {
      availableSlots = validateSlots(request, timezone, scope, JSON.parse(raw));
    } catch {
      return {
        error: 'Some selected times are invalid or on past dates. Please reload and try again.',
      };
    }
    const now = new Date().toISOString();
    const saved = await saveResponse(request, {
      timezone,
      scope,
      availableSlots,
      submittedAt: now,
      updatedAt: now,
    });
    if (!saved) return { error: 'This availability link is no longer available.' };
    let notificationFailed = false;
    try {
      if (!process.env.RESEND_API_KEY || !process.env.TO_EMAIL)
        throw new Error('Email is not configured.');
      const resend = new Resend(process.env.RESEND_API_KEY);
      // The portfolio already declares this canonical origin in its root metadata.
      const adminUrl = `https://gabesantos.ca/meet/admin/${request.id}`;
      const result = await resend.emails.send({
        from: 'Availability | gabesantos.ca <noreply@gabesantos.ca>',
        to: process.env.TO_EMAIL,
        subject: `Availability ${saved === 'new' ? 'received' : 'updated'}: ${request.title}`,
        text: `${request.title}\n${saved === 'new' ? 'New availability submission' : 'Availability updated'}\nView availability: ${adminUrl}`,
        html: `<p><strong>${escapeHtml(request.title)}</strong></p><p>${saved === 'new' ? 'New availability submission.' : 'Availability updated.'}</p><p><a href="${escapeHtml(adminUrl)}">View availability</a></p>`,
      });
      notificationFailed = Boolean(result.error);
    } catch {
      notificationFailed = true;
    }
    revalidatePath(`/meet/${slug}`);
    revalidatePath(`/meet/admin/${request.id}`);
    revalidatePath('/meet/admin');
    return { success: true, notificationFailed };
  } catch {
    return { error: 'Your availability could not be saved. Please try again.' };
  }
}
