import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

import { buildMessage, readCommands } from '../lib/commands.ts';
import {
  hasDeclinedMcpPrompt,
  hasMcpSupport,
  INSTALL_COMMAND,
  MCP_ADAPTER,
  PROMPT_MESSAGE,
  PROMPT_TITLE,
  rememberMcpPromptDeclined,
} from '../lib/mcp.ts';

const run = promisify(execFile);

const agentDirectory = (): string =>
  process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi', 'agent');

export default function azdospec(pi: ExtensionAPI): void {
  pi.on('session_start', async (_event, context) => {
    const agent = agentDirectory();
    if (hasMcpSupport(agent, process.cwd()) || hasDeclinedMcpPrompt(agent)) {
      return;
    }

    // Non-interactive runs (-p, --mode json, --mode rpc) have nowhere to ask,
    // and installing a package nobody consented to is exactly the kind of thing
    // pi leaves to the package author's judgement. Say it and move on.
    if (typeof context.ui.confirm !== 'function') {
      context.ui.notify(`${PROMPT_TITLE}. Run: ${INSTALL_COMMAND}`, 'error');
      return;
    }

    if (!(await context.ui.confirm(PROMPT_TITLE, PROMPT_MESSAGE))) {
      rememberMcpPromptDeclined(agent);
      return;
    }

    try {
      await run('pi', ['install', `npm:${MCP_ADAPTER}`]);
      context.ui.notify(
        `${MCP_ADAPTER} installed. Restart pi to load it.`,
        'info',
      );
    } catch (error) {
      context.ui.notify(
        `Could not install ${MCP_ADAPTER}: ${error instanceof Error ? error.message : String(error)}. Run it yourself: ${INSTALL_COMMAND}`,
        'error',
      );
    }
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
