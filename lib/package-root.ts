import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolved from this file rather than from each caller: the hosts load their
// entry points from folders at different depths, so anything computing the root
// relative to itself breaks the moment a file moves.
export const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
