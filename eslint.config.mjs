import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  next,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Modified copy from react-fast-marquee, kept locally for required custom changes.
    'app/components/marquee.tsx',
  ]),
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);

export default eslintConfig;
