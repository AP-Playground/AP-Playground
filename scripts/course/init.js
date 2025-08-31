import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as coursePage from './course.js'
import * as unitPage from './unit.js'
import * as lessonPage from './lesson.js'


export function uploadCourse({title, slug}) {
  const courseDir = resolve("src/" + slug);
  const nav = JSON.parse(readFileSync(`src/nav/${slug}.json`,"utf-8"));
  if (existsSync(`src/${slug}/index.json`)) {
    coursePage.upload(`/${slug}`, title, nav)
  }
  for (const [unitSlug, unit] of Object.entries(nav.data)) {
    if (existsSync(`src/${slug}/${unitSlug}/index.json`)) {
      unitPage.upload(`/${slug}/${unitSlug}`, unit.prefix + ": " + unit.title, unit)
    }
    for (const [lessonSlug, lesson] of Object.entries(nav.data[unitSlug].data)) {
      if (existsSync(`src/${slug}/${unitSlug}/${lessonSlug}.json`)) {
        lessonPage.upload(`/${slug}/${unitSlug}/${lessonSlug}`, lesson.prefix + ": " + lesson.title)
      }
    }
  }
}