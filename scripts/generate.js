import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, copyFileSync, writeFile, mkdir, read, readFile } from 'fs';
import { resolve, join, dirname, relative, sep } from 'path';
import * as cheerio from 'cheerio';
import * as header from './header.js';
import { uploadCourse } from './course/init.js'

// read templates from src/template
const templateStart = readFileSync("src/template/start.html", "utf-8");
const templateEnd = readFileSync("src/template/end.html", "utf-8");

// fetch up-to-date data from the internet
async function fetchData(url) {
    const response = await fetch(url);
    return await response.text();
}

const examDatesPage = cheerio.load(await fetchData("https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates"));
let examDatesTemp = [];
examDatesPage('table.cb-table tbody').each((i, el1) => {
  examDatesPage(el1.children).each((j, el2) => {
    examDatesTemp.push(examDatesPage(el2).html())
  })
})
examDatesTemp = examDatesTemp.filter(el => !el.includes(`colspan="3"`)).map(el => el.replace("<br>"," "))
global.examDates = {};
examDatesTemp.forEach((el, i) => {
  const date = cheerio.load("<tr>" + el + "</tr>", null, false);
  let temp = [];
  date("tr > *").each((j, el2) => {
    temp.push(date(el2));
  })
  temp[0] = date(temp[0]).text().trim();
  date(temp[1]).find("p").each((j, el2) => {
    if (date(el2).text().trim() !== "") {
      global.examDates["AP " + date(el2).text().trim()] = {
        date: temp[0],
        time: "8 a.m."
      }
    }
  })
  date(temp[2]).find("p").each((j, el2) => {
    if (date(el2).text().trim() !== "") {
      global.examDates["AP " + date(el2).text().trim()] = {
        date: temp[0],
        time: "12 p.m."
      }
    }
  })
})

// set up global courses data
const courses = [
  { title: "AP Biology", slug: "ap-biology" }
]
global.navCourses = "";
courses.forEach(({title, slug}) => {
  global.navCourses += `<li class="item"><a href="/${slug}">${title}</a></li>`
})
const coursesDuration = transitionDuration(courses.length);


// set up global games data
const gamesDuration = transitionDuration(1);


// output directory for all generated files
const outDir = resolve('public');

// ensure the directory exists
if (!existsSync(outDir)) mkdirSync(outDir);



// generate and write unique pages
let aboutPage = templateStart.replace("{{page.title}}", "About");
aboutPage += readFileSync("src/unique/about.html", 'utf-8').replace("{{nav.courses}}", navCourses);
aboutPage += templateEnd;
aboutPage = aboutPage.replace("{{nav.courses.duration}}", coursesDuration).replace("{{nav.games.duration}}", gamesDuration);
aboutPage = aboutPage.replace("{{header.breadcrumbs}}", header.breadcrumbs(["Home", "/"], ["About", ""]))
writeFileSync(join(outDir, "about.html"), aboutPage);
console.log("Uploaded page: about.html");


let coursePage = templateStart.replace("{{page.title}}", "Courses");
coursePage += readFileSync("src/unique/courses.html", "utf-8").replace("{{nav.courses}}", navCourses);
coursePage += templateEnd;
let coursePageList = "";
courses.forEach(({title, slug}) => {
  coursePageList += `<div class="content-block">`
    coursePageList += `<div class="split-header">`
      coursePageList += `<h2>${title}:</h2>`
      coursePageList += `<a href="/${slug}">Course &rightarrow;</a>`
    coursePageList += `</div>`
    coursePageList += `<p>${JSON.parse(readFileSync("src/" + slug + "/index.json", "utf-8")).summary}</p>`
    coursePageList += `<h3>Exam Date: ${examDates[title].date} at ${examDates[title].time}</h3>`
  coursePageList += `</div>`
})
coursePage = coursePage.replace("{{courses-list}}", coursePageList);
coursePage = coursePage.replace("{{nav.courses.duration}}", coursesDuration).replace("{{nav.games.duration}}", gamesDuration);
coursePage = coursePage.replace("{{header.breadcrumbs}}", header.breadcrumbs(["Home", "/"], ["Courses", ""]))
writeFileSync(join(outDir, "courses.html"), coursePage);
console.log("Uploaded page: courses.html");



// write each page
courses.forEach(course => uploadCourse(course));


// copy icons from src/icons to public/icons
const iconsDir = resolve("src/icons")
getFiles(iconsDir).forEach(icon => {
  const srcPath = join(iconsDir, icon)
  const destPath = resolve(outDir, "icons", icon);
  const destDir = dirname(destPath);

  // Ensure destination directory exists
  mkdirSync(destDir, { recursive: true });

  copyFileSync(srcPath, destPath)

  console.log("Uploaded icon: " + icon);
})


// copy stylesheets from src/css to public/css
const stylesheetsDir = resolve("src/css")
getFiles(stylesheetsDir).forEach(css => {
  const srcPath = join(stylesheetsDir, css)
  const destPath = resolve(outDir, "css", css);
  const destDir = dirname(destPath);

  // Ensure destination directory exists
  mkdirSync(destDir, { recursive: true });

  copyFileSync(srcPath, destPath)

  console.log("Uploaded stylesheet: " + css);
})


// copy scripts from src/css to public/css
const scriptsDir = resolve("src/js")
getFiles(scriptsDir).forEach(js => {
  const srcPath = join(scriptsDir, js)
  const destPath = resolve(outDir, "js", js);
  const destDir = dirname(destPath);

  // Ensure destination directory exists
  mkdirSync(destDir, { recursive: true });

  copyFileSync(srcPath, destPath)

  console.log("Uploaded script: " + js);
})

function getFiles(dir) {
  let results = [];

  const entries = readdirSync(dir, {withFileTypes: true, recursive: true});

  entries.forEach(i => {
    if (i.isDirectory()) return;
    results.push(relative(dir, resolve(i.parentPath, i.name)));
  })

  return results;
}

function transitionDuration(itemCount) {
  return (0.47 + 0.03*itemCount) + "s";
}