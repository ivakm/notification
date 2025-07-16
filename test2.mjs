import { checkNewPosts } from './lib/nazk.js';
import { writeToFile } from './lib/file.js';
import * as JSON_DB from './lib/json_db.js';

const db = JSON_DB.init(process.env.JSON_DB_PATH);

let parsedData = (await db.exists('/parsedData'))
  ? await db.getData('/parsedData')
  : {};
let latestParsedData = [];

function verifyParsedData(parsedData, latestParsedData) {
  latestParsedData.filter((item) => {
    if (Reflect.has(parsedData, item.indexKey)) {
      return false;
    }

    Reflect.set(parsedData, item.indexKey, item);
    db.push(`/parsedData/${item.indexKey}`, item);
    return true;
  });
}

latestParsedData = await checkNewPosts((context) => {
  writeToFile(JSON.stringify(context));
}).catch((error) => {
  console.error('Помилка:', error);
});

console.log(verifyParsedData(parsedData, latestParsedData))