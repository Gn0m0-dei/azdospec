import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const MCP_ADAPTER = 'pi-mcp-adapter';
export const INSTALL_COMMAND = `pi install npm:${MCP_ADAPTER}`;

export const PROMPT_TITLE = 'AzDOSpec needs MCP support';
export const PROMPT_MESSAGE = [
  'AzDOSpec reaches Azure DevOps over MCP, and pi ships no MCP support of its own.',
  `${MCP_ADAPTER} is the usual way to add it. Install it now?`,
  'If you already reach MCP another way, decline — this will not ask again.',
].join('\n');

const SETTINGS = 'settings.json';
const STATE = 'azdospec.json';
const PROJECT_DIRECTORY = '.pi';

// Any package naming itself after MCP counts: what AzDOSpec needs is that pi can
// reach a server, not that one particular package provides it.
const NAMES_MCP = /mcp/i;

interface PiPackage {
  source?: string;
}

interface PiSettings {
  packages?: (string | PiPackage)[];
}

interface AzdoSpecState {
  mcpPromptDeclined?: boolean;
}

const read = <T>(path: string): T | undefined =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;

// Read from settings rather than from node_modules: that directory is flat and
// full of transitive dependencies, so an MCP SDK pulled in by something else
// would look like support the user does not have.
const declaredPackages = (settingsDirectory: string): string[] => {
  const settings = read<PiSettings>(join(settingsDirectory, SETTINGS));

  return (settings?.packages ?? []).map((entry) =>
    typeof entry === 'string' ? entry : (entry.source ?? ''),
  );
};

export const hasMcpSupport = (
  agentDirectory: string,
  projectDirectory: string,
): boolean =>
  [agentDirectory, join(projectDirectory, PROJECT_DIRECTORY)]
    .flatMap(declaredPackages)
    .some((name) => NAMES_MCP.test(name));

export const hasDeclinedMcpPrompt = (agentDirectory: string): boolean =>
  read<AzdoSpecState>(join(agentDirectory, STATE))?.mcpPromptDeclined === true;

export const rememberMcpPromptDeclined = (agentDirectory: string): void => {
  const path = join(agentDirectory, STATE);
  const state = read<AzdoSpecState>(path) ?? {};
  const declined: AzdoSpecState = { ...state, mcpPromptDeclined: true };

  writeFileSync(path, `${JSON.stringify(declined, null, 2)}\n`);
};
