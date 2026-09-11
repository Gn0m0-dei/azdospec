import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { packageRoot } from './package-root.ts';

export interface AzdoCommand {
  name: string;
  description: string;
  template: string;
}

// Tolerate CRLF: a Windows checkout delivers \r\n, npm ships \n.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const DESCRIPTION = /^description:\s*(.+)$/m;

// Claude Code resolves this to the installed plugin directory. The other hosts
// load the skill from their own package root, so the paths that follow it are
// already correct once the variable is gone.
// biome-ignore lint/suspicious/noTemplateCurlyInString: Claude Code's placeholder syntax, matched literally
const PLUGIN_ROOT = '${CLAUDE_PLUGIN_ROOT}/';

const MARKDOWN = '.md';
const ARGUMENTS = '$ARGUMENTS';
const COMMAND_DIRECTORY = join(packageRoot, 'commands');

const parse = (name: string, content: string): AzdoCommand => {
  const frontmatter = content.match(FRONTMATTER);
  if (!frontmatter) {
    throw new Error(`Command file ${name} has no frontmatter block.`);
  }

  const description = frontmatter[1].match(DESCRIPTION);
  if (!description) {
    throw new Error(`Command file ${name} declares no description.`);
  }

  return {
    name: `azdo-${name}`,
    description: description[1].trim(),
    template: frontmatter[2].trim().replaceAll(PLUGIN_ROOT, ''),
  };
};

export const buildMessage = (template: string, args: string): string =>
  template.replace(ARGUMENTS, args.trim());

// The Claude Code command files are the single definition of what each command
// asks for. The pi extension and the opencode plugin read them too, so no host
// can drift away from another: a procedure is one edit, not three.
export const readCommands = (): AzdoCommand[] =>
  readdirSync(COMMAND_DIRECTORY)
    .filter((file) => file.endsWith(MARKDOWN))
    .sort()
    .map((file) =>
      parse(
        file.slice(0, -MARKDOWN.length),
        readFileSync(join(COMMAND_DIRECTORY, file), 'utf8'),
      ),
    );
