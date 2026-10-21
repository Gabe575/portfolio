'use client';

import Image from 'next/image';
import Marquee from '@components/marquee';
import { useUI } from '@components/ui-provider';

const languages = [
  { name: 'Azure', icon: <Image src="/svg/azure.svg" alt="Azure" width={48} height={48} /> },
  { name: 'C#', icon: <Image src="/svg/csharp.svg" alt="C#" width={48} height={48} /> },
  { name: 'C++', icon: <Image src="/svg/cplusplus.svg" alt="C++" width={48} height={48} /> },
  { name: 'Git', icon: <Image src="/svg/git.svg" alt="Git" width={48} height={48} /> },
  { name: 'Java', icon: <Image src="/svg/java.svg" alt="Java" width={48} height={48} /> },
  {
    name: 'JavaScript',
    icon: <Image src="/svg/javascript.svg" alt="JavaScript" width={48} height={48} />,
  },
  { name: 'Kotlin', icon: <Image src="/svg/kotlin.svg" alt="Kotlin" width={48} height={48} /> },
  { name: 'Python', icon: <Image src="/svg/python.svg" alt="Python" width={48} height={48} /> },
  {
    name: 'TypeScript',
    icon: <Image src="/svg/typescript.svg" alt="TypeScript" width={48} height={48} />,
  },
  {
    name: 'Visual Basic',
    icon: <Image src="/svg/visualbasic.svg" alt="Visual Basic" width={48} height={48} />,
  },
];
const frameworks = [
  { name: '.NET', icon: <Image src="/svg/dotnet.svg" alt=".NET" width={48} height={48} /> },
  { name: 'Angular', icon: <Image src="/svg/angular.svg" alt="Angular" width={48} height={48} /> },
  { name: 'Astro', icon: <Image src="/svg/astro.svg" alt="Astro" width={48} height={48} /> },
  { name: 'Django', icon: <Image src="/svg/django.svg" alt="Django" width={48} height={48} /> },
  { name: 'MongoDB', icon: <Image src="/svg/mongodb.svg" alt="MongoDB" width={48} height={48} /> },
  { name: 'NextJS', icon: <Image src="/svg/nextjs.svg" alt="NextJS" width={48} height={48} /> },
  { name: 'NodeJS', icon: <Image src="/svg/nodejs.svg" alt="NodeJS" width={48} height={48} /> },
  {
    name: 'Postgres',
    icon: <Image src="/svg/postgres.svg" alt="Postgres" width={48} height={48} />,
  },
  { name: 'React', icon: <Image src="/svg/react.svg" alt="React" width={48} height={48} /> },
  { name: 'Unity', icon: <Image src="/svg/unity.svg" alt="Unity" width={48} height={48} /> },
];

function ToolChip({ tool }: { tool: { name: string; icon: React.ReactNode } }) {
  return (
    <div className="tool-chip">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 lg:h-12 lg:w-12">
        {tool.icon}
      </span>
      {tool.name}
    </div>
  );
}

export default function ScrollingLanguages() {
  const { animationsEnabled } = useUI();

  if (!animationsEnabled) {
    return (
      <ul className="mx-auto flex max-w-7xl flex-wrap justify-center gap-y-3 px-6 sm:gap-y-4 sm:px-10 lg:px-16">
        {[...languages, ...frameworks].map((tool) => (
          <li key={tool.name}>
            <ToolChip tool={tool} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="edge-fade-x flex flex-col gap-3 sm:gap-4">
      {/* Reserve row height: the marquee only renders after mount */}
      <div className="min-h-[66px] sm:min-h-[74px] lg:min-h-[82px]">
        <Marquee direction="left" speed={40} pauseOnHover autoFill>
          {languages.map((tool) => (
            <ToolChip key={tool.name} tool={tool} />
          ))}
        </Marquee>
      </div>
      <div className="min-h-[66px] sm:min-h-[74px] lg:min-h-[82px]">
        <Marquee direction="right" speed={40} pauseOnHover autoFill>
          {frameworks.map((tool) => (
            <ToolChip key={tool.name} tool={tool} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
