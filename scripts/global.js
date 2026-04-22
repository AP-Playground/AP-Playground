import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';


const examDatesData = {};


export function init() {
  return 0;
}

const courseNicknames = {
  "AP U.S. History": "AP United States History"
}
export function examDate(course) {
  return examDatesData[courseNicknames[course] || course];
}


// fetch exam date data from the web
const examDatesPage = cheerio.load(await fetchData("https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates"));
let examDatesTemp = examDatesPage('table > tbody > tr').map((i, el) => examDatesPage(el).html().replace("<br>"," ")).toArray();
examDatesTemp.forEach(el1 => {
  const date = cheerio.load(`<tr>${el1}</tr>`, null, false);
  let temp = [];
  date("tr > *").each((j, el2) => {
    temp.push(date(el2));
  })
  temp[0] = date(temp[0]).text().trim();
  date(temp[1]).find("p").each((j, el2) => {
    examDatesData["AP " + date(el2).text().trim()] = temp[0] + " at 8 a.m."
  })
  date(temp[2]).find("p").each((j, el2) => {
    examDatesData["AP " + date(el2).text().trim()] = temp[0] + " at 12 p.m."
  })
})



// set up global courses data
export const courses = [
  { title: "AP Biology", slug: "ap-biology" },
  { title: "AP Art History", slug: "ap-art-history" },
  { title: "AP World History: Modern", slug: "ap-world-history" },
  { title: "AP U.S. History", slug: "ap-us-history" }
]

const courseTitles = {}
for (const {title, slug} of courses) {
  courseTitles[slug] = title
}
export function courseTitle(slug) {
  return courseTitles[slug]
}

export const navCourses = courses.map(({title, slug}) => `<li class="item"><a href="/${slug}">${title}</a></li>`).join("")

const cedLinks = {}
for (const {title, slug} of courses) {
  cedLinks[slug] = JSON.parse(readFileSync(`src/${slug}/nav.json`, "utf-8")).ced
}

export function ced(course) {
  return cedLinks[course]
}


// set up global tools data
export const tools = [
  { title: "Youtube Player", slug: "yt-player" }
]

const toolTitles = {}
for (const {title, slug} of tools) {
  toolTitles[slug] = title
}
export function toolTitle(slug) {
  return toolTitles[slug];
}


// set up global games data
export const games = [
  { title: "Memory", slug: "memory" },
  { title: "Pinpoint", slug: "pinpoint" },
  { title: "Chronology", slug: "chronology" }
]

const gameTitles = {}
for (const {title, slug} of games) {
  gameTitles[slug] = title
}
export function gameTitle(slug) {
  return gameTitles[slug];
}


// fetch page data from online
async function fetchData(url) {
    const response = await fetch(url);
    return await response.text();
}