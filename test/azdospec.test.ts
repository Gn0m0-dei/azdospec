import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { buildMessage, readCommands } from '../lib/commands.ts';
import { type ConfigWithSkills, configureOpencode } from '../lib/opencode.ts';
import { packageRoot } from '../lib/package-root.ts';

const EXPECTED = ['azdo-apply', 'azdo-archive', 'azdo-init', 'azdo-propose'];

const setup = () => ({
  commands: readCommands(),
  skillsDirectory: join(packageRoot, 'skills'),
});

describe('command files', () => {
  test('each one parses into a name, a description and a template', () => {
    const commands = readCommands();

    expect(commands.map((command) => command.name)).toEqual(EXPECTED);
    for (const command of commands) {
      expect(command.description).not.toHaveLength(0);
      expect(command.template).toMatch(/references\//);
    }
  });

  test('the arguments replace the placeholder', () => {
    expect(buildMessage('Propose: $ARGUMENTS', '  rate limiting  ')).toBe(
      'Propose: rate limiting',
    );
  });

  test('a command taking no arguments leaves no placeholder behind', () => {
    expect(buildMessage('Archive: $ARGUMENTS', '')).toBe('Archive: ');
  });
});

describe('opencode configuration', () => {
  test('registers the commands and the skills directory', () => {
    const config = configureOpencode({}, setup());

    expect(Object.keys(config.command ?? {}).sort()).toEqual(EXPECTED);
    expect(config.command?.['azdo-init'].template).toMatch(/references\//);
    expect(config.skills?.paths).toContain(join(packageRoot, 'skills'));
  });

  test('never overwrites a command the user already configured', () => {
    const mine: ConfigWithSkills = {
      command: { 'azdo-init': { description: 'mine', template: 'mine' } },
    };

    const config = configureOpencode(mine, setup());

    expect(config.command?.['azdo-init'].description).toBe('mine');
  });

  test('adds the skills directory only once', () => {
    const config = configureOpencode({}, setup());
    configureOpencode(config, setup());

    expect(config.skills?.paths).toHaveLength(1);
  });
});
