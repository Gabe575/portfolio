'use client';
import { useEffect, useState, useActionState, useRef, startTransition } from 'react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { sendEmail } from '@/actions';

// Must match the server-side limit in actions.ts
const MESSAGE_LIMIT = 1000;

export default function ContactForm() {
  const [state, action, isPending] = useActionState(sendEmail, null);
  const [success, setSuccess] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [formStart] = useState<string | null>(new Date().toISOString());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessageLength(0);
      setSuccess(true);
    }
  }, [state]);

  const handleTyping = () => {
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current ?? undefined);
    startTransition(async () => {
      action(formData);
    });
  };

  const overLimit = messageLength > MESSAGE_LIMIT;
  const usage = Math.min(messageLength / MESSAGE_LIMIT, 1);
  const error = state?.error && !success ? state.error : '';

  return (
    <form
      className="card space-y-4 p-5 sm:p-8"
      ref={formRef}
      onInput={handleTyping}
      onSubmit={handleSubmit}
      data-spotlight
    >
      <input type="hidden" name="formStart" value={formStart ?? ''} />
      <div className="relative z-2 grid gap-4 sm:grid-cols-2">
        <div className="field">
          <input
            id="contact-name"
            name="name"
            placeholder=" "
            autoComplete="name"
            maxLength={100}
            required
          />
          <label htmlFor="contact-name">Your name</label>
        </div>
        <div className="field">
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder=" "
            autoComplete="email"
            maxLength={150}
            required
          />
          <label htmlFor="contact-email">Your email</label>
        </div>
      </div>
      <input
        type="text"
        name="company"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        maxLength={100}
      />
      <div className="field relative z-2">
        <textarea
          id="contact-message"
          name="message"
          placeholder=" "
          className="h-48 resize-none"
          required
          aria-describedby="contact-count"
          onChange={(e) => setMessageLength(e.target.value.length)}
        />
        <label htmlFor="contact-message">What&apos;s on your mind?</label>
      </div>
      <div className="relative z-2 flex items-center gap-3">
        <div className="h-px flex-1 overflow-hidden bg-line">
          <div
            className={`h-full origin-left transition-transform duration-300 ${overLimit ? 'bg-red-500' : ''}`}
            style={{
              transform: `scaleX(${usage})`,
              background: overLimit ? undefined : 'var(--spectrum)',
            }}
          />
        </div>
        <span
          id="contact-count"
          className={`font-mono text-xs tabular-nums ${overLimit ? 'text-red-700 dark:text-red-400' : 'text-faint'}`}
        >
          {messageLength} / {MESSAGE_LIMIT}
        </span>
      </div>
      <div className="relative z-2 flex flex-col-reverse items-stretch gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="submit"
          disabled={isPending || overLimit}
          className={`group inline-flex min-h-13 items-center justify-center gap-3 rounded-full px-7 py-3 font-medium whitespace-nowrap transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50
            ${success ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black' : 'bg-ink text-bg hover:shadow-[0_0_0_4px_var(--glow)]'}`}
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sending…
            </>
          ) : success ? (
            <>
              <FiCheck aria-hidden /> Message sent
            </>
          ) : (
            <>
              Send message
              <FiArrowRight
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </>
          )}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {success ? (
            <span className="text-muted">Thanks! I&apos;ll get back to you as soon as I can.</span>
          ) : (
            <span className="text-red-700 dark:text-red-400">{error}</span>
          )}
        </p>
      </div>
    </form>
  );
}
