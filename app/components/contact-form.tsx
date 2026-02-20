'use client';
import { useEffect, useState, useActionState, useRef, startTransition } from 'react';
import { sendEmail } from '@/actions';

const MESSAGE_LIMIT = 3000;

export default function ContactForm() {
  const [state, action, isPending] = useActionState(sendEmail, null);
  const [success, setSuccess] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [formStart, setFormStart] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setMessageLength(0);
      setSuccess(true);
    }
  }, [state]);

  useEffect(() => {
    setFormStart(new Date().toISOString());
  }, []);

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

  return (
    <div>
      <form
        className="space-y-4 max-w-xl"
        ref={formRef}
        onInput={handleTyping}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="formStart" value={formStart ?? ''} />
        <input
          name="name"
          placeholder="Your Name"
          className="w-full border p-2"
          maxLength={100}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          className="w-full border p-2"
          maxLength={150}
          required
        />
        <input type="text" name="company" className="hidden" maxLength={100} />
        <textarea
          name="message"
          placeholder="Your Message"
          className="w-full border p-2 mb-0 h-48"
          required
          onChange={(e) => setMessageLength(e.target.value.length)}
        />
        <div
          className={`text-sm text-right sm:pb-8 ${messageLength > MESSAGE_LIMIT ? 'text-red-700 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          {messageLength} / {MESSAGE_LIMIT}
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center gap-8 sm:gap-16">
          <button
            type="submit"
            disabled={isPending || messageLength > MESSAGE_LIMIT}
            className={`px-4 py-2 min-h-12 whitespace-nowrap border-2 ${success ? 'border-green-400 bg-green-200 dark:bg-green-950 dark:border-green-800' : 'border-slate-400 bg-slate-300 active:bg-slate-400 dark:bg-zinc-700 dark:border-zinc-500 dark:active:bg-zinc-500'} disabled:opacity-50 active:scale-95 transition-all duration-300 rounded`}
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-slate-400 dark:border-zinc-500 dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : success ? (
              'Sent!'
            ) : (
              'Send Message'
            )}
          </button>
          <span className="text-red-700 dark:text-red-400">
            {state?.error && !success ? state.error : ''}
          </span>
        </div>
      </form>
    </div>
  );
}
