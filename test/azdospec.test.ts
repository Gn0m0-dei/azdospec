import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { buildMessage, readCommands } from '../lib/commands.ts';
import {
  hasDeclinedMcpPrompt,
  hasMcpSupport,
  rememberMcpPromptDeclined,
} from '../lib/mcp.ts';
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

describe('pi MCP support', () => {
  const piDirectory = (settings?: object): string => {
    const directory = mkdtempSync(join(tmpdir(), 'azdospec-'));
    if (settings) {
      writeFileSync(join(directory, 'settings.json'), JSON.stringify(settings));
    }
    return directory;
  };

  test('a declared MCP package counts as support', () => {
    const agent = piDirectory({
      packages: ['npm:pi-mcp-adapter', 'npm:pi-lens'],
    });

    expect(hasMcpSupport(agent, '/nonexistent-project')).toBe(true);
    rmSync(agent, { recursive: true });
  });

  test('any package naming itself after MCP counts, not just the usual one', () => {
    const agent = piDirectory({ packages: ['npm:@someone/pi-mcp-bridge'] });

    expect(hasMcpSupport(agent, '/nonexistent-project')).toBe(true);
    rmSync(agent, { recursive: true });
  });

  test('a package declared as an object is read too', () => {
    const agent = piDirectory({
      packages: [{ source: 'npm:pi-mcp-adapter', extensions: ['index.ts'] }],
    });

    expect(hasMcpSupport(agent, '/nonexistent-project')).toBe(true);
    rmSync(agent, { recursive: true });
  });

  test('the project settings are read as well as the global ones', () => {
    const agent = piDirectory({ packages: [] });
    const project = mkdtempSync(join(tmpdir(), 'azdospec-'));
    mkdirSync(join(project, '.pi'));
    writeFileSync(
      join(project, '.pi', 'settings.json'),
      JSON.stringify({ packages: ['npm:pi-mcp-adapter'] }),
    );

    expect(hasMcpSupport(agent, project)).toBe(true);
    rmSync(agent, { recursive: true });
    rmSync(project, { recursive: true });
  });

  test('unrelated packages are not mistaken for MCP support', () => {
    const agent = piDirectory({
      packages: ['npm:pi-lens', 'npm:pi-subagents'],
    });

    expect(hasMcpSupport(agent, '/nonexistent-project')).toBe(false);
    rmSync(agent, { recursive: true });
  });

  test('a declined prompt is remembered so it is asked once', () => {
    const agent = piDirectory();

    expect(hasDeclinedMcpPrompt(agent)).toBe(false);
    rememberMcpPromptDeclined(agent);
    expect(hasDeclinedMcpPrompt(agent)).toBe(true);
    rmSync(agent, { recursive: true });
  });
});

describe('opencode configuration', () => {
  test('registers the commands and the skills directory', () => {
    const config = configureOpencode({}, setup());

    expect(Object.keys(config.command ?? {}).sort()).toEqual(EXPECTED);
    expect(config.command?.['azdo-init'].template).toMatch(/references\//);
    expect(config.skills?.paths).toContain(join(packageRoot, 'skills'));
  });

  test('declares the MCP server only when the organization is known', () => {
    expect(configureOpencode({}, setup()).mcp).toEqual({});

    const configured = configureOpencode(
      {},
      { ...setup(), organization: 'contoso' },
    );

    expect(configured.mcp?.['azure-devops']).toMatchObject({
      url: 'https://mcp.dev.azure.com/contoso',
    });
  });

  test('never overwrites what the user already configured', () => {
    const mine: ConfigWithSkills = {
      command: { 'azdo-init': { description: 'mine', template: 'mine' } },
      mcp: { 'azure-devops': { type: 'remote', url: 'https://example.test' } },
    };

    const config = configureOpencode(mine, {
      ...setup(),
      organization: 'contoso',
    });

    expect(config.command?.['azdo-init'].description).toBe('mine');
    expect(config.mcp?.['azure-devops']).toMatchObject({
      url: 'https://example.test',
    });
  });

  test('adds the skills directory only once', () => {
    const config = configureOpencode({}, setup());
    configureOpencode(config, setup());

    expect(config.skills?.paths).toHaveLength(1);
  });
});
