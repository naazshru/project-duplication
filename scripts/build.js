import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const sources = ['index.html', 'scripts', 'styles'];

async function copyRecursive(sourcePath, destinationPath) {
  const stats = await fs.stat(sourcePath);

  if (stats.isDirectory()) {
    await fs.mkdir(destinationPath, { recursive: true });
    const entries = await fs.readdir(sourcePath);
    await Promise.all(
      entries.map((entry) =>
        copyRecursive(
          path.join(sourcePath, entry),
          path.join(destinationPath, entry)
        )
      )
    );
    return;
  }

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
}

async function build() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  await Promise.all(
    sources.map(async (source) => {
      const sourcePath = path.join(projectRoot, source);
      try {
        await fs.access(sourcePath);
        const destinationPath = path.join(distDir, source);
        await copyRecursive(sourcePath, destinationPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return;
        }
        throw error;
      }
    })
  );

  const messageLines = [
    'StoryFlow Studio build complete!',
    `Assets copied to: ${distDir}`,
    'You can now deploy the contents of the dist folder to any static host.'
  ];

  console.log(messageLines.join('\n'));
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
