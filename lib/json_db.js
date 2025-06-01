import { JsonDB, Config } from 'node-json-db';

let db;

export const init = (filePath = radio) => {
  return (db = new JsonDB(new Config(filePath, true, false, 'xxx')));
};
