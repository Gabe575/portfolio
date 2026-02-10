import { FiGithub, FiLinkedin } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center px-6 sm:items-start sm:px-16">
        <section id="home" className="min-h-screen py-24 flex flex-col items-center text-center justify-between sm:items-start sm:text-left md:py-32">
          <div>
            <h1 className="max-w-xs text-4xl font-semibold leading-10 tracking-tight whitespace-nowrap sm:text-7xl">
              Gabriel Santos
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-500">
              Software Engineer
            </p>
          </div>
        </section>

        <section id="about" className="min-h-screen py-16 flex flex-col items-center text-center sm:items-start sm:text-left md:py-24">
          <h2 className="text-2xl font-semibold tracking-tight">About</h2>
          <p>Website under development, check back soon for updates!</p>
        </section>

        <section id="projects" className="min-h-screen py-16 flex flex-col items-center text-center sm:items-start sm:text-left md:py-24">
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        </section>

        <section id="contact" className="min-h-screen py-16 flex flex-col items-center text-center sm:items-start sm:text-left md:py-24">
          <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
        </section>
        
        
      </main>
      <footer className="py-12 px-6 text-sm text-zinc-500 text-center w-full bg-zinc-200 dark:bg-zinc-900 shadow-md transition-all duration-300 sm:px-16">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Gabriel Santos. Built with Next.js.</p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/Gabe575" aria-label="GitHub"><FiGithub/></a>
            <a href="https://linkedin.com/in/gabriel2004santos" aria-label="LinkedIn"><FiLinkedin/></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
