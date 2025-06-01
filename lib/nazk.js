import * as cheerio from 'cheerio';
import { Semaphore } from './semaphore.js';

const NAZK_CODES = [
  '4343197',
  '4341074',
  '4053001',
  '4052867',
  '4053097',
  '4341519',
  '4342690',
  '4341577',
  '4341850',
  '3333392',
  '4053298',
  '4052956',
  '34898855',
  '4052873',
  '4052732',
  '4052933',
  '34032213',
  '32897190',
  '24812116',
  '4052821',
  '4343168',
  '34686390',
  '4053275',
  '4052761',
  '4053105',
  '4053329',
  '36297559',
  '4342424',
  '4341413',
  '36297522',
  '4341560',
  '4052962',
  '41073075',
  '4341790',
  '4340493',
  '33852448',
  '4342045',
  '4341637',
  '4341844',
  '4340968',
  '4341956',
  '3331393',
  '4052985',
  '44905109',
  '44681692',
  '44810138',
  '44679374',
  '44762032',
  '45090450',
  '44146947',
  '44790913',
  '44333891',
  '44370858',
  '44907766',
  '44670895',
  '44887499',
  '44737080',
  '44836774',
  '44790232',
  '44653576',
  '44836120',
  '44691014',
  '44278614',
  '44995889',
  '44272449',
  '44739726',
  '44776050',
  '44048570',
  '44000591',
  '45102764',
  '44693624',
  '44692327',
  '45126790',
  '44329149',
  '44899730',
  '45118067',
  '44667389',
  '44964033',
  '44922920',
  '44244585',
  '45084185',
  '45075364',
];

export const queryNazk = async (codes, from, to) => {
  const url = new URL(
    `https://public.nazk.gov.ua/documents/list?q=${encodeURIComponent(
      codes.join(',+'),
    )}&full_search=1&date_from=${from}&date_to=${to}`,
  );
  console.log(url.toString());
  return await fetch(url);
};

export const checkNewPosts = async () => {
  const codes = Array.from(NAZK_CODES);
  const parsedData = [];

  const semaphore = new Semaphore(3);

  let i = 0;
  let step = 15;
  const from = Math.floor(Date.now() / 1000);
  const to = from - 3600;

  while (i < codes.length) {
    await semaphore.enter();
    const partialCodes =
      i + step > codes.length ? codes.slice(i) : codes.slice(i, i + step);
    try {
      const response = await queryNazk(partialCodes, from, to);

      if (response) {
        const result = await response.text();
        const $ = cheerio.load(result);
        const html = $('.fio a');

        for (let i = 0; i < html.length; i++) {
          parsedData.push({
            name: `${cheerio.load(html[i]).text()}`,
            url: `${domain}${html[i].attribs.href}`,
          });
        }
      }
    } catch (error) {
      console.error('Помилка запиту:', error);
    }
    await semaphore.leave();
    i += step;
  }

  return parsedData;
};

