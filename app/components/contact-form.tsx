'use client';
import * as React from 'react';
import { sendEmail } from '@/actions';

const MESSAGE_LIMIT = 1000;

export default function ContactForm() {
  const [state, action, isPending] = React.useActionState(sendEmail, null);
  const [success, setSuccess] = React.useState(false);
  const [messageLength, setMessageLength] = React.useState(0);
  const [formStart, setFormStart] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setMessageLength(0);
      setSuccess(true);
    }
  }, [state]);

  React.useEffect(() => {
    setFormStart(new Date().toISOString());
  }, []);

  const handleTyping = () => {
    if (success) setSuccess(false);
  };

  return (
    <div>
      <form action={action} className="space-y-4 max-w-xl" ref={formRef} onChange={handleTyping}>
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
          className={`text-sm text-right pb-8 ${messageLength > MESSAGE_LIMIT ? 'text-red-700 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          {messageLength} / {MESSAGE_LIMIT}
        </div>
        <button
          type="submit"
          disabled={isPending || messageLength > MESSAGE_LIMIT}
          className={`px-4 py-2 h-12 border-2 ${success ? 'border-green-400 bg-green-200 dark:bg-green-950 dark:border-green-800' : 'border-slate-400 bg-slate-300 active:bg-slate-400 dark:bg-zinc-700 dark:border-zinc-500 dark:active:bg-zinc-500'} disabled:opacity-50 active:scale-95 transition-all duration-300 rounded`}
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-slate-400 dark:border-zinc-500 dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : success ? (
            'Sent!'
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
