import { JsonDB, Config } from 'node-json-db';

let db;

export const init = (filePath = 'db') => {
  return (db = new JsonDB(new Config(filePath, true, false, '/')));
};
