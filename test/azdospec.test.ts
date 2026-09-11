import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, test } from 'vitest';

import { buildMessage, readCommands } from '../lib/commands.ts';
import { mcpAdapterWarning } from '../lib/mcp.ts';
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

describe('pi adapter check', () => {
  // Built here rather than committed: a fixture living under a path named
  // node_modules is treated specially by too much tooling to be worth it.
  const withAdapterInstalled = (): string => {
    const agentDirectory = mkdtempSync(join(tmpdir(), 'azdospec-'));
    mkdirSync(join(agentDirectory, 'npm', 'node_modules', 'pi-mcp-adapter'), {
      recursive: true,
    });
    return agentDirectory;
  };

  test('says nothing when the adapter is installed alongside the agent', () => {
    const agentDirectory = withAdapterInstalled();

    expect(
      mcpAdapterWarning(agentDirectory, '/nonexistent-project'),
    ).toBeUndefined();

    rmSync(agentDirectory, { recursive: true });
  });

  test('finds the adapter installed inside the project instead', () => {
    const projectDirectory = mkdtempSync(join(tmpdir(), 'azdospec-'));
    mkdirSync(
      join(projectDirectory, '.pi', 'npm', 'node_modules', 'pi-mcp-adapter'),
      { recursive: true },
    );

    expect(
      mcpAdapterWarning('/nonexistent-agent', projectDirectory),
    ).toBeUndefined();

    rmSync(projectDirectory, { recursive: true });
  });

  test('names the command that installs it when it is missing', () => {
    const warning = mcpAdapterWarning(
      '/nonexistent-agent',
      '/nonexistent-project',
    );

    expect(warning).toMatch(/pi install npm:pi-mcp-adapter/);
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
