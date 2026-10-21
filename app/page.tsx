import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  FiArrowUp,
  FiArrowUpRight,
  FiBookOpen,
  FiBriefcase,
  FiGithub,
  FiLinkedin,
} from 'react-icons/fi';
import ScrollingLanguages from '@components/scrolling-languages';
import InteractivePortrait from '@components/interactive-portrait';
import Project from '@components/project';
import ContactForm from '@components/contact-form';
import Hero from '@components/hero/base-hero';
import HeroHud from '@components/hero/hero-hud';
import AnimationsToggle from '@components/animations-toggle';
import Reveal from '@components/reveal';
import LocalTime from '@components/local-time';
import { projects } from '@/data/projects';
import { experience } from '@/data/experience';

const LINKEDIN = 'https://linkedin.com/in/gabriel2004santos';
const GITHUB = 'https://github.com/Gabe575';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

// schema.org profile for search results. Public profile facts only; no email or address.
const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Gabriel Santos',
  url: 'https://gabesantos.ca',
  image: 'https://gabesantos.ca/og-image.png',
  jobTitle: 'Software Engineer',
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Western University' },
  knowsAbout: ['Full-stack development', 'Cloud computing', 'Mobile development'],
  sameAs: [LINKEDIN, GITHUB],
};

function SectionHeader({
  label,
  children,
  aside,
}: Readonly<{ label: string; children: ReactNode; aside?: ReactNode }>) {
  return (
    <div className="flex flex-col gap-6 pb-12 md:flex-row md:items-end md:justify-between md:pb-16">
      <Reveal>
        <p className="eyebrow">{label}</p>
        <h2 className="section-title mt-5 max-w-4xl">{children}</h2>
      </Reveal>
      {aside && (
        <Reveal delay={0.1} className="max-w-sm text-muted md:pb-2 md:text-right">
          {aside}
        </Reveal>
      )}
    </div>
  );
}

const FACTS = [
  { label: 'Based in', value: 'Ontario, Canada' },
  { label: 'Studying', value: 'Software Engineering', detail: 'Western University' },
  { label: 'Focus', value: 'Full-stack, cloud & mobile applications' },
];

const EXPERIENCE = [
  'Production financial software',
  'Customer-facing features',
  'APIs & microservices',
  'Mobile applications',
  'Embedded C++',
  'Serverless infrastructure',
  'Local LLM inference & RAG pipelines',
  'Full-stack web development',
  'Game development',
];

export default function Home() {
  return (
    // Clips the stage's overhang so it doesn't add scroll length at the end of the page
    <div className="relative flex flex-col items-center overflow-y-clip" id="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
      />
      <section className="hero-stage sticky top-0 -z-10 flex select-none w-full flex-col items-center text-center text-white">
        <div aria-hidden className="hero-dusk pointer-events-none absolute inset-0" />
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
        <div aria-hidden className="hero-grain pointer-events-none absolute inset-0" />
        <Hero />
        <HeroHud />
      </section>
      <div className="sticky bottom-6 mb-6 flex justify-center">
        <AnimationsToggle />
      </div>

      <main className="sheet relative w-full rounded-t-4xl sm:rounded-t-[3rem]">
        {/* ---------- About ---------- */}
        <section id="about" className="scroll-mt-8 px-5 pt-24 pb-20 sm:px-10 md:pt-32 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              label="About"
              aside={
                <>
                  Hey! I&apos;m Gabe, a software engineer and full stack developer based in{' '}
                  <b className="text-ink">Ontario, Canada</b>.
                </>
              }
            >
              Whatever the stack, I&apos;ll build it.
            </SectionHeader>

            <div className="grid gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-5 lg:row-span-2">
                <div className="flex h-full flex-col items-center justify-center py-4 lg:min-h-105 lg:py-0">
                  <InteractivePortrait />
                </div>
              </Reveal>

              <Reveal delay={0.08} className="lg:col-span-7">
                <div data-spotlight className="card h-full p-7 sm:p-10">
                  <p className="relative z-2 text-lg leading-relaxed text-muted sm:text-xl lg:text-2xl lg:leading-relaxed">
                    <span className="text-ink">
                      Experienced professional in building full-stack, cloud, and mobile
                      applications.
                    </span>{' '}
                    I&apos;ve worked on production financial software, customer-facing features,
                    APIs, microservices, and mobile applications, with an interest in learning new
                    technologies and solving complex problems. My experience includes a variety of
                    programming languages and frameworks, developed through internships, personal
                    projects, and studying <b className="text-ink">Software Engineering</b> at{' '}
                    <b className="text-ink">Western University</b>.
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
                {FACTS.map((fact, i) => (
                  <Reveal key={fact.label} delay={0.12 + i * 0.06}>
                    <div data-spotlight className="card h-full p-6">
                      <p className="relative z-2 font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
                        {fact.label}
                      </p>
                      <p className="relative z-2 mt-6 font-display text-xl font-semibold tracking-tight">
                        {fact.value}
                      </p>
                      {fact.detail && (
                        <p className="relative z-2 text-sm text-muted">{fact.detail}</p>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1} className="mt-4">
              <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
                <p className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
                  Experience across
                </p>
                <ul className="flex flex-wrap gap-2">
                  {EXPERIENCE.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Experience ---------- */}
        <section
          id="experience"
          className="scroll-mt-8 border-t border-line px-5 pt-24 pb-20 sm:px-10 md:pt-32 lg:px-16"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              label="Experience"
              aside="Production banking software, research hardware, and the degree in between."
            >
              Where I&apos;ve shipped.
            </SectionHeader>

            <ol className="relative">
              {/* Timeline rail */}
              <span
                aria-hidden
                className="absolute top-2 bottom-2 left-[7px] w-px opacity-60 md:left-[calc(13rem+7px)]"
                style={{ background: 'var(--spectrum)' }}
              />
              {experience.map((item, i) => {
                const Icon = item.kind === 'education' ? FiBookOpen : FiBriefcase;
                return (
                  <li
                    key={`${item.org}-${item.role}`}
                    className="relative grid gap-3 pb-6 pl-10 last:pb-0 md:grid-cols-[13rem_1fr] md:gap-10 md:pl-0"
                  >
                    <Reveal delay={i * 0.06} className="md:pt-6">
                      <p className="font-mono text-xs tracking-[0.12em] whitespace-nowrap text-faint uppercase md:pr-8 md:text-right">
                        {item.period}
                      </p>
                    </Reveal>

                    {/* Node on the rail */}
                    <span
                      aria-hidden
                      className="absolute top-0.5 left-0 grid h-[15px] w-[15px] place-items-center rounded-full border border-line-strong bg-bg md:top-7 md:left-52"
                    >
                      <span
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ background: 'var(--spectrum)' }}
                      />
                    </span>

                    <Reveal delay={i * 0.06 + 0.04}>
                      <article data-spotlight className="card p-6 sm:p-8 md:ml-6">
                        <div className="relative z-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                                {item.role}
                              </h3>
                              <p className="mt-1 text-muted">{item.org}</p>
                            </div>
                            <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-faint sm:grid">
                              <Icon aria-hidden />
                            </span>
                          </div>
                          <p className="mt-4 text-ink">{item.summary}</p>
                          {item.highlights.length > 0 && (
                            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted sm:text-base">
                              {item.highlights.map((highlight) => (
                                <li key={highlight} className="flex gap-3">
                                  <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          )}
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <li key={tag} className="chip">
                                {tag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ---------- Toolkit ---------- */}
        <section id="toolkit" aria-labelledby="toolkit-title" className="pt-8 pb-24">
          <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-10 lg:px-16">
            <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Toolkit</p>
                <h2
                  id="toolkit-title"
                  className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  Languages &amp; frameworks
                </h2>
              </div>
              <p className="font-mono text-xs text-faint">20 tools · hover to pause</p>
            </Reveal>
          </div>
          <ScrollingLanguages />
        </section>

        {/* ---------- Projects ---------- */}
        <section
          id="projects"
          className="scroll-mt-8 border-t border-line px-5 pt-24 pb-28 sm:px-10 md:pt-32 lg:px-16"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              label="Projects"
              aside="Production sites, research hardware and experiments. Select a project to open the case file."
            >
              Selected work.
            </SectionHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              {projects.map((project, i) => (
                <Reveal
                  key={project.slug}
                  delay={i === 0 ? 0 : 0.08 * i}
                  className={i === 0 ? 'md:col-span-2' : ''}
                >
                  <Project project={project} index={i} featured={i === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section
          id="contact"
          className="scroll-mt-8 border-t border-line px-5 pt-24 pb-28 sm:px-10 md:pt-32 lg:px-16"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">Contact</p>
              <h2 className="section-title mt-5">Let&apos;s build something together.</h2>
              <p className="mt-6 text-base text-muted sm:text-lg">
                Questions? Ideas? Random thoughts? I&apos;m open to it all. Fill out the form or
                connect with me on{' '}
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-ink"
                >
                  LinkedIn
                </a>{' '}
                and I&apos;ll get back to you as soon as I can!
              </p>

              <ul className="mt-10 border-t border-line">
                {[
                  {
                    label: 'LinkedIn',
                    handle: 'gabriel2004santos',
                    href: LINKEDIN,
                    icon: FiLinkedin,
                  },
                  { label: 'GitHub', handle: 'Gabe575', href: GITHUB, icon: FiGithub },
                ].map(({ label, handle, href, icon: Icon }) => (
                  <li key={label} className="border-b border-line">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 py-5"
                    >
                      <Icon
                        className="text-faint transition-colors group-hover:text-accent"
                        aria-hidden
                      />
                      <span className="font-display text-xl font-medium">{label}</span>
                      <span className="font-mono text-xs text-faint">{handle}</span>
                      <FiArrowUpRight
                        className="ml-auto text-faint transition-transform duration-300 group-hover:rotate-45 group-hover:text-ink"
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-6 font-mono text-xs text-faint">
                It&apos;s <LocalTime className="text-muted" /> in Ontario right now.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-7">
              <ContactForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative w-full overflow-hidden border-t border-line bg-bg px-5 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold">Gabriel Santos</p>
            <p className="text-sm text-muted">Software engineer · Ontario, Canada</p>
          </div>
          <nav aria-label="Footer" className="flex gap-12 text-sm">
            <ul className="space-y-2">
              {['about', 'experience', 'projects', 'contact'].map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="link-underline text-muted capitalize hover:text-ink"
                  >
                    {id}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              <li>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-muted hover:text-ink"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-muted hover:text-ink"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </nav>
          <a
            href="#home"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Back to top
            <FiArrowUp className="transition-transform group-hover:-translate-y-0.5" aria-hidden />
          </a>
        </div>

        <p
          aria-hidden
          className="pointer-events-none mt-16 -mb-[0.2em] text-center font-display text-[12.5vw] leading-none font-bold tracking-[-0.06em] whitespace-nowrap select-none"
          style={{
            WebkitTextStroke: '1px var(--line-strong)',
            color: 'transparent',
            maskImage: 'linear-gradient(180deg, #000 30%, transparent 95%)',
          }}
        >
          Gabriel Santos
        </p>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-2 border-t border-line py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Gabriel Santos. Built with Next.js.</p>
        </div>
      </footer>
    </div>
  );
}
