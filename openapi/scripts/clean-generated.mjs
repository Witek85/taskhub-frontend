import { rm } from 'node:fs/promises';

const [, , directory] = process.argv;

if (!directory) {
  console.error('Usage: node clean-generated.mjs <directory>');
  process.exit(1);
}

try {
  await rm(directory, {
    recursive: true,
    force: true,
  });

  console.log(`Removed generated directory: ${directory}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
