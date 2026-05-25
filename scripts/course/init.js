import { existsSync, readFileSync } from 'fs';
import * as util from '../util.js'
import * as coursePage from './course.js'
import * as unitPage from './unit.js'
import * as topicPage from './topic.js'
import * as xlsxToVocab from './xlsxToVocab.js'


export function uploadCourse({title, slug}) {
  const nav = JSON.parse(readFileSync(`src/${slug}/nav.json`,"utf-8"));
  util.copyFile(`src/${slug}/nav.json`,`/${slug}/nav.json`);

  const vocabData = JSON.parse(readFileSync(`src/${slug}/vocab-data.json`,"utf-8"));
  util.copyFile(`src/${slug}/vocab-data.json`,`/${slug}/vocab-data.json`);

  const courseVocab = xlsxToVocab.convert(`src/${slug}/vocab.xlsx`,"utf-8");
  util.writeFile(`/${slug}/vocab.json`, JSON.stringify(courseVocab))

  if (existsSync(`src/${slug}/index.json`)) {
    coursePage.upload(`/${slug}`, title, nav)
  }
  for (const [unitSlug, unit] of Object.entries(nav.data)) {
    if (existsSync(`src/${slug}/${unitSlug}/index.json`)) {
      unitPage.upload(`/${slug}/${unitSlug}`, unit.prefix + ": " + unit.title, unit, vocabData.units[unitSlug])
    }
    if (!nav.data[unitSlug].hasOwnProperty("data")) continue;
    for (const [topicSlug, topic] of Object.entries(nav.data[unitSlug].data)) {
      if (existsSync(`src/${slug}/${unitSlug}/${topicSlug}.json`)) {
        topicPage.upload(`/${slug}/${unitSlug}/${topicSlug}`, topic.prefix + ": " + topic.title, courseVocab, vocabData)
      }
    }
  }
}