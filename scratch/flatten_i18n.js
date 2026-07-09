import { ui } from '../src/data/i18n.js';
import fs from 'fs';
import path from 'path';

function flatten(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        if (typeof item === 'object') {
          Object.assign(result, flatten(item, `${newKey}.${idx}`));
        } else {
          result[`${newKey}.${idx}`] = item;
        }
      });
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

const flatRu = flatten(ui.ru);
const flatUz = flatten(ui.uz);
const flatEn = flatten(ui.en);

const allKeys = Array.from(new Set([
  ...Object.keys(flatRu),
  ...Object.keys(flatUz),
  ...Object.keys(flatEn)
]));

const dictionary = allKeys.map(key => ({
  key,
  ru: flatRu[key] || '',
  uz: flatUz[key] || '',
  en: flatEn[key] || ''
}));

fs.writeFileSync(
  path.join(process.cwd(), 'server/src/db/default_translations.json'),
  JSON.stringify(dictionary, null, 2)
);
console.log('Translations flattened and saved!');
