const generateTextFromArray = (arr) => {
  let result = ``;

  arr.forEach((elem) => {
    result += `Ім'я: ${elem.name}, \nПосилання: ${elem.url}\n ==============================\n`;
  });

  return result;
};
module.exports = { generateTextFromArray };
