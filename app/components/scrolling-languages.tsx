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

export default function ScrollingLanguages() {
  const { animationsEnabled } = useUI();
  return (
    <>
      {animationsEnabled ? (
        <>
          <div className="relative flex flex-col justify-between items-center w-full h-68 md:hidden">
            <Marquee direction="left" gradient gradientWidth={100}>
              {languages.map((lang, idx) => (
                <div key={idx} className="languages-div mr-2">
                  {lang.icon} {lang.name}
                </div>
              ))}
            </Marquee>
            <Marquee direction="right" gradient gradientWidth={100}>
              {frameworks.map((lang, idx) => (
                <div key={idx} className="languages-div mr-2">
                  {lang.icon} {lang.name}
                </div>
              ))}
            </Marquee>
          </div>
          <div className="relative flex flex-row justify-between items-start w-68 min-w-68 -mt-24 max-md:hidden h-207 lg:h-256 lg:w-96 lg:min-w-96 xl:w-140 xl:min-w-140">
            <Marquee direction="up" gradient>
              {languages.map((lang, idx) => (
                <div key={idx} className="languages-div mb-2 xl:mb-4">
                  {lang.icon} {lang.name}
                </div>
              ))}
            </Marquee>
            <Marquee direction="down" gradient>
              {frameworks.map((lang, idx) => (
                <div key={idx} className="languages-div mb-2 xl:mb-4">
                  {lang.icon} {lang.name}
                </div>
              ))}
            </Marquee>
          </div>
        </>
      ) : (
        <div className="flex md:flex-col gap-4 w-full h-64 md:h-207 lg:h-256 md:-mt-24 items-center justify-center">
          <div className="flex max-md:flex-col gap-4 max-sm:hidden">
            <div className="languages-div xl:h-56 xl:w-56">
              {languages[0].icon} {languages[0].name}
            </div>
            <div className="languages-div xl:h-56 xl:w-56">
              {languages[1].icon} {languages[1].name}
            </div>
          </div>
          <div className="flex max-md:flex-col gap-4">
            <div className="languages-div xl:h-56 xl:w-56">
              {languages[4].icon} {languages[4].name}
            </div>
            <div className="languages-div xl:h-56 xl:w-56">
              {languages[7].icon} {languages[7].name}
            </div>
          </div>
          <div className="flex max-md:flex-col gap-4 max-sm:hidden">
            <div className="languages-div xl:h-56 xl:w-56">
              {frameworks[0].icon} {frameworks[0].name}
            </div>
            <div className="languages-div xl:h-56 xl:w-56">
              {frameworks[7].icon} {frameworks[7].name}
            </div>
          </div>
          <div className="flex max-md:flex-col gap-4">
            <div className="languages-div xl:h-56 xl:w-56">
              {frameworks[1].icon} {frameworks[1].name}
            </div>
            <div className="languages-div xl:h-56 xl:w-56">
              {frameworks[5].icon} {frameworks[5].name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
