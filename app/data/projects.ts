export interface ProjectData {
  slug: string;
  title: string;
  tagline: string;
  context: string;
  image: string;
  description: string[];
  highlight?: { value: string; label: string };
  tags: string[];
  stack: string[];
  experiments?: string[];
  link?: { href: string; label: string };
}

export const projects: ProjectData[] = [
  {
    slug: 'mayoral-campaign',
    title: 'Mayoral Candidate Website',
    tagline: 'A production campaign platform, designed and built independently.',
    context: 'Client work · Live',
    image: '/mayor.jpg',
    description: [
      'I independently designed and developed this production campaign website in coordination with a local mayoral candidate, creating a polished and accessible platform for sharing campaign information, policies, and updates with voters.',
      'The site also integrates payment processing and transactional email, with serverless infrastructure.',
    ],
    highlight: { value: '2,000+', label: 'visitors in a single day' },
    tags: ['Astro', 'Stripe', 'Cloudflare'],
    stack: ['Astro (TypeScript)', 'Stripe', 'Resend (contact form)', 'Cloudflare D1 + Workers'],
    link: {
      href: 'https://web.archive.org/web/20261024205643/https://zebuunformayor.ca',
      label: 'zebuunformayor.ca (archived)',
    },
  },
  {
    slug: 'traffic-counter',
    title: 'Roadside Traffic Counter',
    tagline: 'Embedded hardware and cloud services for traffic research.',
    context: 'Research · Western University',
    image: '/counter.jpg',
    description: [
      'I developed a roadside traffic-counting system in collaboration with a research team at Western University. I programmed and optimized Arduino-based hardware in C++, improving vehicle speed detection accuracy and runtime performance while expanding the system to collect additional traffic data.',
      'I also developed Python and Django services for data processing and device configuration and deployed supporting services using Linux, SSH, and Azure.',
    ],
    tags: ['C++', 'Django', 'Azure'],
    stack: [
      'Arduino (C++)',
      'Python + Django',
      'HTML + CSS + JavaScript',
      'Linux + SSH',
      'Azure (hosting, IoT, Service Bus)',
    ],
  },
  {
    slug: 'portfolio',
    title: 'Portfolio Website',
    tagline: 'This site: a showcase and a sandbox for experiments.',
    context: 'Personal · Ongoing',
    image: '/portfolio.jpg',
    description: [
      'This portfolio website serves as both a showcase for my work and a personal sandbox for experimenting with new technologies. I designed and developed the site from scratch, incorporating interactive animations, custom WebGL effects, a serverless contact system, and responsive design across devices.',
    ],
    tags: ['Next.js', 'Three.js', 'WebGL'],
    stack: [
      'NextJS + React TypeScript',
      'Tailwind CSS + PostCSS',
      'Resend (contact form)',
      'Upstash Redis',
      'Vercel (hosting)',
    ],
    experiments: [
      'ESLint + Prettier + Husky',
      'ThreeJS + React Three Fiber',
      'Custom WebGL shaders',
    ],
    link: { href: 'https://github.com/Gabe575', label: 'github.com/Gabe575' },
  },
];
