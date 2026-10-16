import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const [, , sourceUrl, destination] = process.argv;

if (!sourceUrl || !destination) {
  console.error('Usage: node download-spec.mjs <source-url> <destination>');
  process.exit(1);
}

try {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`OpenAPI download failed: ${response.status} ${response.statusText}`);
  }

  const specification = await response.text();

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, specification, 'utf8');

  console.log(`OpenAPI specification saved to: ${destination}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
