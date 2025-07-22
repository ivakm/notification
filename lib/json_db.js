import { JsonDB, Config } from 'node-json-db';

// eslint-disable-next-line no-unused-vars
let db;

export const init = (filePath = 'db') =>
  (db = new JsonDB(new Config(filePath, true, false, '/')));
