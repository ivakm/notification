import { checkNewPosts } from './lib/nazk.js';
import { writeToFile } from './lib/file.js';

checkNewPosts((context) => {
  writeToFile(JSON.stringify(context));
}).catch((error) => {
  console.error('Помилка:', error);
});
