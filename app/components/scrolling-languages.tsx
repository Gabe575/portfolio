import Image from 'next/image';
import Marquee from '@components/marquee';

const languages = [
  { name: 'C#', icon: <Image src="/csharp.svg" alt="C#" width={48} height={48} /> },
  { name: 'C++', icon: <Image src="/cplusplus.svg" alt="C++" width={48} height={48} /> },
  { name: 'Git', icon: <Image src="/git.svg" alt="Git" width={48} height={48} /> },
  { name: 'Java', icon: <Image src="/java.svg" alt="Java" width={48} height={48} /> },
  {
    name: 'JavaScript',
    icon: <Image src="/javascript.svg" alt="JavaScript" width={48} height={48} />,
  },
  { name: 'Kotlin', icon: <Image src="/kotlin.svg" alt="Kotlin" width={48} height={48} /> },
  { name: 'Python', icon: <Image src="/python.svg" alt="Python" width={48} height={48} /> },
  {
    name: 'TypeScript',
    icon: <Image src="/typescript.svg" alt="TypeScript" width={48} height={48} />,
  },
  {
    name: 'Visual Basic',
    icon: <Image src="/visualbasic.svg" alt="Visual Basic" width={48} height={48} />,
  },
];
const frameworks = [
  { name: '.NET', icon: <Image src="/dotnet.svg" alt=".NET" width={48} height={48} /> },
  { name: 'Angular', icon: <Image src="/angular.svg" alt="Angular" width={48} height={48} /> },
  { name: 'Django', icon: <Image src="/django.svg" alt="Django" width={48} height={48} /> },
  { name: 'MongoDB', icon: <Image src="/mongodb.svg" alt="MongoDB" width={48} height={48} /> },
  { name: 'NextJS', icon: <Image src="/nextjs.svg" alt="NextJS" width={48} height={48} /> },
  { name: 'NodeJS', icon: <Image src="/nodejs.svg" alt="NodeJS" width={48} height={48} /> },
  { name: 'Postgres', icon: <Image src="/postgres.svg" alt="Postgres" width={48} height={48} /> },
  { name: 'React', icon: <Image src="/react.svg" alt="React" width={48} height={48} /> },
  { name: 'Unity', icon: <Image src="/unity.svg" alt="Unity" width={48} height={48} /> },
];

const ScrollingLanguages = () => {
  return (
    <>
      <div className="relative flex flex-col justify-between items-center h-48 w-full h-68 min-h-68 md:hidden">
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
  );
};

export default ScrollingLanguages;
