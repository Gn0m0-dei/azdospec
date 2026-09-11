import type { Config } from '@opencode-ai/plugin';

import type { AzdoCommand } from './commands.ts';

// `skills.paths` is in the published opencode config schema but missing from
// the types shipped with @opencode-ai/plugin, so it is declared here until they
// catch up.
export interface ConfigWithSkills extends Config {
  skills?: { paths?: string[] };
}

export interface OpencodeSetup {
  commands: AzdoCommand[];
  skillsDirectory: string;
  organization?: string;
}

const SERVER_NAME = 'azure-devops';

// Everything already present is left alone: the user's own commands, skill
// paths and servers outrank anything this package would contribute.
export const configureOpencode = (
  config: ConfigWithSkills,
  { commands, skillsDirectory, organization }: OpencodeSetup,
): ConfigWithSkills => {
  config.command ??= {};
  for (const { name, description, template } of commands) {
    config.command[name] ??= { description, template };
  }

  config.skills ??= {};
  config.skills.paths ??= [];
  if (!config.skills.paths.includes(skillsDirectory)) {
    config.skills.paths.push(skillsDirectory);
  }

  // Declared only when the organization is known: a server pointing at an
  // unresolved organization fails on every call, which is worse than absent.
  config.mcp ??= {};
  if (organization && !config.mcp[SERVER_NAME]) {
    config.mcp[SERVER_NAME] = {
      type: 'remote',
      url: `https://mcp.dev.azure.com/${organization}`,
      enabled: true,
    };
  }

  return config;
};
