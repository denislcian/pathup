// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    rules: {
      // The library root ships 1500+ icons. Add icons to src/components/icons.ts instead.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              message: 'Import icons from @/components/icons so the bundle only ships what we use.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/icons.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    ignores: ['dist/*', '.expo/*', 'supabase/*'],
  },
]);
