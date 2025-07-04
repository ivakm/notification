import * as fs from 'node:fs';

export const writeToFile = async (content) => {
  const fileName = `${Date.now()}.json`;
  const dirPath = new URL(`../docs/`, import.meta.url);
  const filePath = new URL(fileName, dirPath);

  await fs.promises.mkdir(dirPath, { recursive: true });
  return fs.promises.writeFile(filePath, content, 'utf8').then(() => {
    console.log('File written successfully');
  });
};
