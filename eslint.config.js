import { defineConfig, globalIgnores } from 'eslint/config';

import metarhiaConfig from 'eslint-config-metarhia';

const metarhiaRules = metarhiaConfig[0];

metarhiaRules.languageOptions.sourceType = 'module';

export default defineConfig([
  metarhiaRules,
  globalIgnores(['node_modules/*', '.history', '.continue']),
]);
