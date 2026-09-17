import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

import { buildMessage, readCommands } from '../lib/commands.ts';

export default function azdospec(pi: ExtensionAPI): void {
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
