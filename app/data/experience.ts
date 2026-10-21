// Kept at the level of a public profile: roles, dates and outcomes only.
// Internal system details and contact info are intentionally left out.
export interface ExperienceItem {
  kind: 'work' | 'education';
  role: string;
  org: string;
  period: string;
  summary: string;
  highlights: string[];
  tags: string[];
}

export const experience: ExperienceItem[] = [
  {
    kind: 'work',
    role: 'Software Developer Analyst Intern',
    org: 'Libro Credit Union',
    period: 'May 2025 – Sep 2026',
    summary:
      'Full-stack and mobile development on production banking software within an Agile Scrum team.',
    highlights: [
      'Led end-to-end development of new customer-facing GIC features, from defining requirements with backend teams through implementation.',
      'Shipped full-stack features across web and mobile using C#, .NET, React and TypeScript.',
      'Resolved complex Android and iOS issues spanning app linking, device compatibility and OS upgrades.',
      'Added asynchronous processing to a payments microservice using Azure Service Bus.',
      'Built an Android instrumentation test suite and a CI/CD pipeline for dev testing of web releases.',
    ],
    tags: ['C#', '.NET', 'React', 'TypeScript', 'Kotlin', 'Azure'],
  },
  {
    kind: 'work',
    role: 'Undergraduate Research Intern',
    org: 'Western University',
    period: 'May 2024 – May 2025',
    summary: 'Built a roadside traffic-counting device in collaboration with an industry partner.',
    highlights: [
      'Improved runtime performance and vehicle speed detection accuracy of the Arduino firmware in C++.',
      'Built Python and Django services and web interfaces for data processing and device configuration.',
      'Expanded the device to collect additional traffic data types and deployed services on Linux and Azure.',
    ],
    tags: ['C++', 'Arduino', 'Python', 'Django', 'Azure'],
  },
  {
    kind: 'education',
    role: 'B.E.Sc. Software Engineering',
    org: 'Western University',
    period: 'Expected May 2027',
    summary: "Dean's Honour List for three consecutive years.",
    highlights: [
      'Built an online multiplayer UNO game with a multithreaded C++ backend that hosts multiple game rooms at once (team project).',
      'Developed a small-scale 3D third-person adventure game in Unity (team project).',
      'Programmed an embedded fitness tracker with a display that counts steps, detects walking and running, and tracks average resting, walking and running heart rate.',
      'Coursework in machine learning algorithms, artificial intelligence, cloud computing and computer networking.',
    ],
    tags: ['C++', 'Unity', 'Embedded', 'Machine learning', 'Cloud computing'],
  },
];
