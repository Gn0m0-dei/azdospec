import { homedir } from 'node:os';
import { join } from 'node:path';

import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

import { buildMessage, readCommands } from '../lib/commands.ts';
import { mcpAdapterWarning } from '../lib/mcp.ts';

const agentDirectory = (): string =>
  process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi', 'agent');

export default function azdospec(pi: ExtensionAPI): void {
  pi.on('session_start', async (_event, context) => {
    const warning = mcpAdapterWarning(agentDirectory(), process.cwd());
    if (warning) context.ui.notify(warning, 'error');
  });

  for (const { name, description, template } of readCommands()) {
    pi.registerCommand(name, {
      description,
      handler: async (args, context) => {
        const message = buildMessage(template, args);

        if (context.isIdle()) {
          pi.sendUserMessage(message);
          return;
        }

        pi.sendUserMessage(message, { deliverAs: 'followUp' });
        context.ui.notify(`${name} queued as a follow-up.`, 'info');
      },
    });
  }
}
