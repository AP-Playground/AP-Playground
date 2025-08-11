import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';


const examDatesData = {};


export function init() {
  return 0;
}

export function examDate(course) {
  return examDatesData[course];
}


// fetch exam date data from the web
const examDatesPage = cheerio.load(await fetchData("https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates"));
let examDatesTemp = examDatesPage('table.cb-table tbody > :not([colspan])').map((i, el) => examDatesPage(el).html().replace("<br>"," ")).toArray();
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
  { title: "AP Biology", slug: "ap-biology" }
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
  cedLinks[slug] = JSON.parse(readFileSync(`src/nav/${slug}.json`, "utf-8")).ced
}

export function ced(course) {
  return cedLinks[course]
}


// fetch page data from online
async function fetchData(url) {
    const response = await fetch(url);
    return await response.text();
}