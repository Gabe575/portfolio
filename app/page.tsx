import { FiGithub, FiLinkedin } from 'react-icons/fi';
import Image from 'next/image';
import ScrollingLanguages from '@components/scrolling-languages';
import ContactForm from '@components/contact-form';
import Hero from '@components/hero';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center" id="home">
      <section
        className="sticky top-0 h-screen
        min-h-screen w-full flex flex-col items-center text-center sm:items-start sm:text-left -z-10"
      >
        <div
          className="absolute inset-0 
        bg-linear-to-b from-inherit via-slate-900 to-blue-300 
        transition-opacity duration-300 
        dark:opacity-0 opacity-100 pointer-events-none"
        />

        <div
          className="absolute inset-0 
        bg-linear-to-b from-blue-900 via-slate-950 to-purple-900 
        transition-opacity duration-300 
        dark:opacity-100 opacity-0 pointer-events-none"
        />
        <Hero />
      </section>
      <main className="relative flex min-h-screen w-full flex-col items-center sm:items-start">
        <section
          id="about"
          className="bg-darkish w-full pt-20 flex flex-col items-center text-center bg-black md:items-start md:text-left md:px-16 md:pt-24"
        >
          <div className="max-w-7xl mx-auto w-full h-full">
            <div className="flex flex-col items-center justify-between md:flex-row md:items-start gap-8 max-md:pb-16 ">
              <div className="items-center text-center max-sm:px-6">
                <h2 className="section-title md:text-left pb-8">About</h2>
                <div className="inline-block p-1 mb-4 rounded-full bg-linear-to-r from-pink-400 via-indigo-400 to-emerald-400 animate-border">
                  <div className="rounded-full overflow-hidden max-w-32 sm:max-w-48 lg:max-w-96">
                    <Image src="/headshot.jpg" alt="Gabriel Santos" width={480} height={480} />
                  </div>
                </div>
                <p className="lg:text-xl">
                  Hey! I&apos;m Gabe, a software engineer and full stack developer based&nbsp;in
                </p>
                <p className="whitespace-nowrap text-lg lg:text-2xl">
                  <b>Ontario, Canada</b>
                </p>
                <div className="md:text-start py-4 max-sm:px-6 max-md:px-16 md:py-8">
                  <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400">
                    I&apos;ve gained experience in a variety of programming languages and frameworks
                    throughout my time working in internships, personal projects, and studying{' '}
                    <b>Software Engineering</b> at <b>Western University</b>.
                  </p>
                </div>
              </div>
              <ScrollingLanguages />
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="bg-normal min-h-screen w-full pt-20 px-6 flex flex-col items-center text-center sm:items-start sm:text-left sm:px-16 md:pt-24"
        >
          <div className="max-w-7xl mx-auto w-full h-full">
            <h2 className="section-title">Projects</h2>
          </div>
        </section>

        <section
          id="contact"
          className="bg-darkish w-full py-20 px-6 flex flex-col items-center text-center sm:items-start sm:text-left sm:px-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto w-full h-full">
            <h2 className="section-title">Contact</h2>
            <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 pb-8">
              Questions? Ideas? Random thoughts? I&apos;m open to it all. Fill out the form below or
              connect with me on{' '}
              <a
                href="https://linkedin.com/in/gabriel2004santos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-indigo-400 hover:underline"
              >
                LinkedIn
              </a>{' '}
              and I&apos;ll get back to you as soon as I can!
            </p>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className="py-12 px-6 text-sm text-zinc-500 text-center w-full bg-zinc-200 dark:bg-zinc-900 shadow-md transition-all duration-300 sm:px-16 z-10">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Gabriel Santos. Built with Next.js.</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/Gabe575"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub size={16} />
            </a>
            <a
              href="https://linkedin.com/in/gabriel2004santos"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
