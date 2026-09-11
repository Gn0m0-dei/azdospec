import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ADAPTER = 'pi-mcp-adapter';

const isInstalledUnder = (root: string): boolean =>
  existsSync(join(root, 'npm', 'node_modules', ADAPTER));

// pi ships no MCP of its own by design, so the adapter is what makes the Azure
// DevOps server reachable at all. Without it every command fails at its first
// write, far from the cause — hence a warning at session start instead.
export const mcpAdapterWarning = (
  agentDirectory: string,
  projectDirectory: string,
): string | undefined => {
  if (
    isInstalledUnder(agentDirectory) ||
    isInstalledUnder(join(projectDirectory, '.pi'))
  ) {
    return undefined;
  }

  return `AzDOSpec talks to Azure DevOps over MCP, which pi provides through ${ADAPTER}. Install it with: pi install npm:${ADAPTER}`;
};
