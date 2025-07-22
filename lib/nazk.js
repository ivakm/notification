import * as cheerio from 'cheerio';
import { Semaphore } from './semaphore.js';
import { setTimeout as sleep } from 'node:timers/promises';

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
  'Донецька',
];

const DOMAIN = 'https://public.nazk.gov.ua';

export const queryNazk = async (codes, from, to, repeat = 3) => {
  const url = new URL(
    `${DOMAIN}/documents/list?q=${encodeURIComponent(
      codes.join(',+'),
    )}&full_search=1&date_from=${from}&date_to=${to}`,
  );

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response;
  } catch (error) {
    if (repeat > 0) {
      console.log(`Attempting to repeat the request, attempt ${repeat}`);
      const delay = 200 * repeat;

      await sleep(delay);

      return await queryNazk(codes, from, to, repeat - 1);
    } else {
      throw error;
    }
  }
};
/**
 * @param {function} cb function that will be called with the parsed data
 */
export const checkNewPosts = async (cb) => {
  const codes = [...NAZK_CODES];
  const parsedData = [];
  const urls = [];
  const failedUrls = [];
  const failedUrlErrors = new Set();
  const semaphore = new Semaphore(2);
  const timeRangeInSec = process.env.NAZK_TIME_RANGE * 60 * 60;
  const to = Math.floor(Date.now() / 1000);
  const from = to - timeRangeInSec;
  const dateAndPositionRegExp =
    /Дата та час подання:(\d{2}\.\d{2}\.\d{4} \d{2}:\d{2})Посада:([^\n]+)/;

  let i = 0;
  let step = 15;

  while (i < codes.length) {
    await semaphore.enter();
    const partialCodes =
      i + step > codes.length ? codes.slice(i) : codes.slice(i, i + step);
    let res;
    try {
      res = await queryNazk(partialCodes, from, to);
      urls.push(res.url);
      if (res.ok) {
        const result = await res.text();
        const $ = cheerio.load(result);
        const articles = $('article');

        for (let i = 0; i < articles.length; i++) {
          const article = $(articles[i]);
          const name = article.find('.fio a');
          const text = article.find('.info-2').text().trim();
          let datetime = null;
          let position = null;
          const match = text.match(dateAndPositionRegExp);

          if (match) {
            datetime = match[1];
            position = match[2];
          }

          parsedData.push({
            name: name.text(),
            url: `${DOMAIN}${name.attr('href')}`,
            datetime,
            position,
            indexKey: text,
          });
        }
      } else {
        failedUrls.push(res.url);
        failedUrlErrors.add(await res.json());
      }
    } catch (error) {
      failedUrls.push(res.url);
      failedUrlErrors.add(error);
      console.error('Помилка запиту:', error);
    }
    await semaphore.leave();
    i += step;
  }

  if (cb) {
    try {
      await cb({
        urls,
        failedUrls,
        parsedData,
        failedUrlErrors: [...failedUrlErrors],
      });
    } catch (error) {
      console.error('Помилка обробки колбеку:', error);
    }
  }
  return parsedData;
};
