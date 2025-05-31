const generateTextFromArray = (arr) => {
  let result = ``;

  arr.forEach((elem) => {
    result += `Ім'я: ${elem.name}, \nПосилання: ${elem.url}\n ==============================\n`;
  });

  return result;
};

const getBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || '{}');
};

const sendResponse = (res = null, code = 200, data = {}, headers = {}) => {
  res
    .writeHead(code, { 'Content-Type': 'application/json', ...headers })
    .end(JSON.stringify(data));
};

module.exports = { generateTextFromArray, getBody, sendResponse };
