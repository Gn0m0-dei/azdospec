import { join } from 'node:path';

import type { Plugin } from '@opencode-ai/plugin';

import { readCommands } from '../lib/commands.ts';
import { configureOpencode } from '../lib/opencode.ts';
import { packageRoot } from '../lib/package-root.ts';

// OpenCode's legacy plugin loader treats every function exported from a plugin
// module as a plugin, so this file exports exactly one. Everything else lives
// in lib/.

export const AzdoSpecPlugin: Plugin = async () => {
  const setup = {
    commands: readCommands(),
    skillsDirectory: join(packageRoot, 'skills'),
  };

  return {
    config: async (config) => {
      configureOpencode(config, setup);
    },
  };
};
