import { FiGithub, FiLinkedin } from 'react-icons/fi';
import Image from 'next/image';
import ScrollingLanguages from '@components/scrolling-languages';
import InteractivePortrait from '@components/interactive-portrait';
import Project from '@components/project';
import ContactForm from '@components/contact-form';
import Hero from '@components/hero';
import AnimationsToggle from './components/animations-toggle';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center" id="home">
      <section
        className="sticky top-0 h-screen
        min-h-screen w-full flex flex-col items-center text-center sm:items-start sm:text-left -z-10"
      >
        <div
          className="absolute inset-0 
        bg-linear-to-b from-[#ededed] via-slate-900 to-indigo-300 
        transition-opacity duration-300 
        dark:opacity-0 opacity-100 pointer-events-none"
        />

        <div
          className="absolute inset-0 
        bg-linear-to-b from-[#141414] via-slate-950 to-purple-950 
        transition-opacity duration-300 
        dark:opacity-100 opacity-0 pointer-events-none"
        />
        <Hero />
      </section>
      <div className="sticky bottom-4 mb-4 flex justify-center">
        <AnimationsToggle />
      </div>
      <main className="relative flex min-h-screen w-full flex-col items-center sm:items-start">
        <section
          id="about"
          className="bg-[#ddd] dark:bg-[#111] w-full pt-20 flex flex-col items-center text-center md:items-start md:text-left md:px-16 md:pt-24 transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto w-full h-full">
            <div className="flex flex-col items-center justify-between md:flex-row md:items-start gap-8 max-md:pb-16 ">
              <div className="items-center text-center max-sm:px-6">
                <h2 className="section-title md:text-left pb-8">About</h2>
                <InteractivePortrait />
                <p className="lg:text-xl">
                  Hey! I&apos;m Gabe, a software engineer and full stack developer based&nbsp;in
                </p>
                <p className="whitespace-nowrap text-lg lg:text-2xl">
                  <b>Ontario, Canada</b>
                </p>
                <div className="md:text-start py-4 max-sm:px-6 max-md:px-16 md:py-8">
                  <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400">
                    Experienced professional in building full-stack, cloud, and mobile applications.
                    I&apos;ve worked on production financial software, customer-facing features,
                    APIs, microservices, and mobile applications, with an interest in learning new
                    technologies and solving complex problems. My experience includes a variety of
                    programming languages and frameworks, developed through internships, personal
                    projects, and studying <b>Software Engineering</b> at <b>Western University</b>.
                  </p>
                </div>
              </div>
              <ScrollingLanguages />
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="bg-[#ededed] dark:bg-[#141414] min-h-200 w-full pt-20 px-6 flex flex-col items-center text-center sm:items-start sm:text-left sm:px-16 md:pt-24 transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="section-title">Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto pt-16 pb-32">
            <Project title="Mayoral Candidate Website" image="/mayor.jpg">
              <div className="max-w-5xl text-base sm:leading-relaxed md:text-lg lg:text-xl xl:text-2xl xl:leading-loose">
                <p>
                  I independently designed and developed this production campaign website in
                  coordination with a local mayoral candidate, creating a polished and accessible
                  platform for sharing campaign information, policies, and updates with voters. The
                  site also integrates payment processing and transactional email, with serverless
                  infrastructure supporting campaign operations and handling traffic of up to 2,000
                  visitors in a single day.
                </p>
                <br />
                <p className="font-semibold lg:text-center lg:p-4">The stack:</p>
                <ul className="flex flex-col sm:flex-row sm:justify-center gap-x-16 flex-wrap list-disc list-inside">
                  <li>Astro (TypeScript)</li>
                  <li>Stripe</li>
                  <li>Resend (contact form)</li>
                  <li>Cloudflare D1 + Workers</li>
                </ul>
                <br />
                <p className="font-semibold lg:text-center lg:p-4">
                  Live URL:{' '}
                  <a
                    href="https://zebuunformayor.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-indigo-400 hover:underline lg:p-4"
                  >
                    zebuunformayor.ca
                  </a>
                </p>
              </div>
            </Project>

            <Project title="Roadside Traffic Counter" image="/counter.jpg">
              <div className="max-w-5xl text-base sm:leading-relaxed md:text-lg lg:text-xl xl:text-2xl xl:leading-loose">
                <p>
                  I developed a roadside traffic-counting system in collaboration with a research
                  team at Western University. I programmed and optimized Arduino-based hardware in
                  C++, improving vehicle speed detection accuracy and runtime performance while
                  expanding the system to collect additional traffic data. I also developed Python
                  and Django services for data processing and device configuration and deployed
                  supporting services using Linux, SSH, and Azure.
                </p>
                <br />
                <p className="font-semibold lg:text-center lg:p-4">The stack:</p>
                <ul className="flex flex-col sm:flex-row sm:justify-center gap-x-16 flex-wrap list-disc list-inside">
                  <li>Arduino (C++)</li>
                  <li>Python + Django</li>
                  <li>HTML + CSS + JavaScript</li>
                  <li>Linux + SSH</li>
                  <li>Azure (hosting, IoT, Service Bus)</li>
                </ul>
              </div>
            </Project>

            <Project title="Portfolio Website" image="/portfolio.jpg">
              <div className="max-w-5xl text-base sm:leading-relaxed md:text-lg lg:text-xl xl:text-2xl xl:leading-loose">
                <p>
                  This portfolio website serves as both a showcase for my work and a personal
                  sandbox for experimenting with new technologies. I designed and developed the site
                  from scratch, incorporating interactive animations, custom WebGL effects, a
                  serverless contact system, and responsive design across devices.
                </p>
                <br />
                <p className="font-semibold lg:text-center lg:p-4">The stack:</p>
                <ul className="flex flex-col sm:flex-row sm:justify-center gap-x-16 flex-wrap list-disc list-inside">
                  <li>NextJS + React TypeScript</li>
                  <li>Tailwind CSS + PostCSS</li>
                  <li>Resend (contact form)</li>
                  <li>Upstash Redis</li>
                  <li>Vercel (hosting)</li>
                </ul>
                <br />
                <p className="font-semibold lg:text-center lg:p-4">Experiments:</p>
                <ul className="flex flex-col sm:flex-row sm:justify-center gap-x-16 flex-wrap list-disc list-inside">
                  <li>ESLint + Prettier + Husky</li>
                  <li>ThreeJS + React Three Fiber</li>
                  <li>Custom WebGL shaders</li>
                </ul>
              </div>
            </Project>
          </div>
        </section>

        <section
          id="contact"
          className="bg-[#ddd] dark:bg-[#111] w-full py-20 px-6 flex flex-col items-center text-center sm:items-start sm:text-left sm:px-16 md:py-24 transition-colors duration-300"
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
