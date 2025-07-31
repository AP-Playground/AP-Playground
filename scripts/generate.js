import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, copyFileSync, writeFile, mkdir, read, readFile } from 'fs';
import { resolve, join, dirname } from 'path';
import * as cheerio from 'cheerio';

// read templates from src/template
const templateStart = readFileSync("src/template/start.html", "utf-8");
const templateEnd = readFileSync("src/template/end.html", "utf-8");

const lessonTemplate = templateStart + readFileSync("src/template/lesson.html", "utf-8") + templateEnd;
const unitTemplate = templateStart + readFileSync("src/template/unit.html", "utf-8") + templateEnd;
const courseTemplate = templateStart + readFileSync("src/template/course.html", "utf-8") + templateEnd;

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
let examDates = {};
examDatesTemp.forEach((el, i) => {
  const date = cheerio.load("<tr>" + el + "</tr>", null, false);
  let temp = [];
  date("tr > *").each((j, el2) => {
    temp.push(date(el2));
  })
  temp[0] = date(temp[0]).text().trim();
  date(temp[1]).find("p").each((j, el2) => {
    if (date(el2).text().trim() !== "") {
      examDates["AP " + date(el2).text().trim()] = {
        date: temp[0],
        time: "8 a.m."
      }
    }
  })
  date(temp[2]).find("p").each((j, el2) => {
    if (date(el2).text().trim() !== "") {
      examDates["AP " + date(el2).text().trim()] = {
        date: temp[0],
        time: "12 p.m."
      }
    }
  })
})


const courses = [
  { title: "AP Biology", slug: "ap-biology" }
]
let navCourses = "";
courses.forEach(({title, slug}) => {
  navCourses += `<li class="item"><a href="/${slug}">${title}</a></li>`
})


// output directory for all generated files
const outDir = resolve('public');

// ensure the directory exists
if (!existsSync(outDir)) mkdirSync(outDir);



// generate and write unique pages
let aboutPage = templateStart.replace("{{page.title}}", "About");
aboutPage += readFileSync("src/unique/about.html", 'utf-8').replace("{{nav.courses}}", navCourses);
aboutPage += templateEnd;
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
writeFileSync(join(outDir, "courses.html"), coursePage);
console.log("Uploaded page: courses.html");


// array of pages to generate
const generatePages = [
  'ap-biology/index.json',
  'ap-biology/unit-1/index.json',
  'ap-biology/unit-1/lesson-0.json',
  'ap-biology/unit-1/lesson-1.json',
  'ap-biology/unit-1/lesson-2.json',
  'ap-biology/unit-1/lesson-3.json',
  'ap-biology/unit-1/lesson-4.json',
  'ap-biology/unit-1/lesson-5.json',
  'ap-biology/unit-1/lesson-6.json',
  'ap-biology/unit-1/lesson-7.json',
  'ap-biology/unit-2/index.json',
  'ap-biology/unit-2/lesson-1.json',
  'ap-biology/unit-2/lesson-2.json',
  'ap-biology/unit-2/lesson-3.json',
  'ap-biology/unit-2/lesson-4.json',
  'ap-biology/unit-2/lesson-5.json',
  'ap-biology/unit-2/lesson-6.json',
  'ap-biology/unit-2/lesson-7.json',
  'ap-biology/unit-2/lesson-8.json',
  'ap-biology/unit-2/lesson-9.json',
  'ap-biology/unit-2/lesson-10.json',
  'ap-biology/unit-3/index.json',
  'ap-biology/unit-3/lesson-1.json',
  'ap-biology/unit-3/lesson-2.json',
  'ap-biology/unit-3/lesson-3.json',
  'ap-biology/unit-3/lesson-4.json',
  'ap-biology/unit-3/lesson-5.json',
  'ap-biology/unit-4/index.json',
  'ap-biology/unit-4/lesson-1.json',
  'ap-biology/unit-4/lesson-2.json',
  'ap-biology/unit-4/lesson-3.json',
  'ap-biology/unit-4/lesson-4.json',
  'ap-biology/unit-4/lesson-5.json',
  'ap-biology/unit-4/lesson-6.json'
];

// write each page
generatePages.forEach((filename) => {
  const fullPath = join(outDir, filename.replace(".json", ".html").replace("/index",""));
  const dir = dirname(fullPath);

  // Ensure parent directories exist
  mkdirSync(dir, { recursive: true });

  writeFileSync(fullPath, genGeneric(filename));

  console.log("Uploaded page: " + filename);
});


// copy icons from src/icons to public/icons
const iconsDir = resolve("src/icons")
const icons = readdirSync(iconsDir);
icons.forEach(icon => {
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
const stylesheets = readdirSync(stylesheetsDir);
stylesheets.forEach(css => {
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
const scripts = readdirSync(scriptsDir);
scripts.forEach(js => {
  const srcPath = join(scriptsDir, js)
  const destPath = resolve(outDir, "js", js);
  const destDir = dirname(destPath);

  // Ensure destination directory exists
  mkdirSync(destDir, { recursive: true });

  copyFileSync(srcPath, destPath)

  console.log("Uploaded script: " + js);
})


// origin point of generate functions
function genGeneric(filename) {
  const slug = filename.replace(".json", "").replace("/index", "");
  const data = JSON.parse(readFileSync("src/" + filename, 'utf-8'));

  if (data.type === "lesson") {
    return genLesson(slug, data);
  } else if (data.type === "unit") {
    return genUnit(slug, data);
  } else if (data.type === "course") {
    return genCourse(slug, data);
  }
}


// function to generate lesson content
function genLesson(lessonSlug, data) {
  let page = lessonTemplate;

  const navPath = resolve("src", data["nav"] + ".json");
  const navData = JSON.parse(readFileSync(navPath, 'utf-8'));
  const pagePath = lessonSlug.split("/")

  page = page.replace("{{nav.courses}}", navCourses)
  page = page.replaceAll("{{course.title}}", navData.title)
  page = page.replaceAll("{{course.slug}}", pagePath[0]);
  page = page.replaceAll("{{unit.slug}}", pagePath[1]);
  page = page.replaceAll("{{lesson.slug}}", pagePath[2]);

  let navText = "";
  navData.units.forEach((unit, unitIdx) => {
    navText += `<li class="item"><a href="/${navData.course}/${unit.slug}">${unit.prefix}: ${unit.title}</a></li>`
    if (unit.slug === pagePath[1] && unit.hasOwnProperty("lessons")) {
      unit.lessons.forEach((lesson, lessonIdx) => {
        if (lesson.slug === pagePath[2]) {
          navText += `<li class="sub-item side-nav-current"><a href="/${navData.course}/${unit.slug}/${lesson.slug}">${lesson.prefix}: ${lesson.title}</a></li>`;
          
          page = page.replaceAll("{{page.title}}", lesson.prefix + ": " + lesson.title);

          page = page.replaceAll("{{unit.title}}", unit.prefix + ": " + unit.title);
          page = page.replaceAll("{{lesson.title}}", lesson.prefix + ": " + lesson.title);

          if (lessonIdx === 0) {
            page = page.replace("{{navigation.previous}}", `/${navData.course}/${unit.slug}`)
          } else {
            page = page.replace("{{navigation.previous}}", `/${navData.course}/${unit.slug}/${unit.lessons[lessonIdx - 1].slug}`)
          }

          if (lessonIdx === unit.lessons.length - 1) {
            page = page.replace("{{navigation.next}}", `/${navData.course}/${navData.units[unitIdx + 1].slug}`)
          } else {
            page = page.replace("{{navigation.next}}", `/${navData.course}/${unit.slug}/${unit.lessons[lessonIdx + 1].slug}`)
          }

        } else {
          navText += `<li class="sub-item"><a href="/${navData.course}/${unit.slug}/${lesson.slug}">${lesson.prefix}: ${lesson.title}</a></li>`
        }
      })
    }
  })

  page = page.replace("{{navigation}}", navText);

  page = page.replace("{{lesson.summary}}", data["summary"])

  const vocabData = data["vocab"]
  let vocabText = "";

  vocabData.forEach(vocab => {
    vocabText += `<li><a target="_blank" href="${vocab.link}">${vocab.term}</a></li>`;
  })

  page = page.replace("{{lesson.vocab}}", vocabText);
  page = page.replace("{{lesson.vocab-row-count}}", Math.ceil(vocabData.length/2))
  page = page.replace("{{lesson.vocab-row-count-3}}", Math.ceil(vocabData.length/3))

  const linkData = data["links"];
  let linkText = "";

  linkData.forEach(link => {
    linkText += `<li><a target="_blank" href="${link["link"]}">${link.title}</a></li>`
  })

  page = page.replace("{{lesson.links}}", linkText);

  const vidData = data["videos"];
  let vidText = "";

  vidData.forEach(vid => {
    vidText += `<div class="video-container">`
      vidText += `<div class="video-header">`
        vidText += `<h3>${vid.title}</h3>`
        vidText += `<a target="_blank" href="https://www.youtube.com/watch?v=${vid.link}"></a>`
      vidText += `</div>`;
      vidText += genVideoEmbed(vid.link);
    vidText += `</div>`
  })

  page = page.replace("{{lesson.videos}}", vidText)

  return page;
}


// function to generate unit content
function genUnit(unitSlug, data) {
  let page = unitTemplate;

  const navPath = resolve("src", data["nav"] + ".json");
  const navData = JSON.parse(readFileSync(navPath, 'utf-8'));
  const pagePath = unitSlug.split("/")

  page = page.replace("{{nav.courses}}", navCourses)
  page = page.replaceAll("{{course.title}}", navData.title)
  page = page.replaceAll("{{course.slug}}", pagePath[0]);
  page = page.replaceAll("{{unit.slug}}", pagePath[1]);

  page = page.replaceAll("{{course.ced}}", navData.ced)

  let navText = "";
  navData.units.forEach((unit, unitIdx) => {
    if (unit.slug === pagePath[1]) {
      navText += `<li class="item side-nav-current"><a href="/${navData.course}/${unit.slug}">${unit.prefix}: ${unit.title}</a></li>`;
      if (unit.hasOwnProperty("lessons")) {
        unit.lessons.forEach(lesson => {
          navText += `<li class="sub-item"><a href="/${navData.course}/${unit.slug}/${lesson.slug}">${lesson.prefix}: ${lesson.title}</a></li>`
        })
      }

      page = page.replaceAll("{{page.title}}", unit.prefix + ": " + unit.title)
      page = page.replaceAll("{{unit.title}}", unit.prefix + ": " + unit.title)

      if (unitIdx === 0) {
        page = page.replace("{{navigation.previous}}", "/" + navData.course);
      } else if (navData.units[unitIdx-1].hasOwnProperty("lessons")) {
        page = page.replace("{{navigation.previous}}", `/${navData.course}/${navData.units[unitIdx - 1].slug}/${navData.units[unitIdx - 1].lessons.at(-1).slug}`);
      } else {
        page = page.replace("{{navigation.previous}}", `/${navData.course}/${navData.units[unitIdx - 1].slug}`)
      }

      if (unit.hasOwnProperty("lessons")) {
        page = page.replace("{{navigation.next}}", `/${navData.course}/${unit.slug}/${unit.lessons[0].slug}`);
      } else if (unitIdx === navData.units.length - 1) {
        page = page.replace("{{navigation.next}}", "/" + navData.course)
      } else {
        page = page.replace("{{navigation.next}}", `/${navData.course}/${navData.units[unitIdx + 1].slug}`)
      }

    } else {
      navText += `<li class="item"><a href="/${navData.course}/${unit.slug}">${unit.prefix}: ${unit.title}</a></li>`
    }
  })

  page = page.replace("{{navigation}}", navText);

  page = page.replace("{{unit.summary}}", data["summary"])

  const unitVidData = data["unit-video"];
  let unitVidText = "";

  unitVidText += `<div class="video-header">`
    unitVidText += `<h2>Unit Review:</h2>`
    unitVidText += `<a target="_blank" href="https://www.youtube.com/watch?v=${unitVidData}"></a>`
  unitVidText += `</div>`;

  unitVidText += `<div class="video-container">`
    unitVidText += genVideoEmbed(unitVidData);
  unitVidText += `</div>`

  page = page.replace("{{unit.unit-video}}", unitVidText)

  const gameData = data["games"]
  let gameText = "";

  gameData.forEach(game => {
    gameText += `<li><a target="_blank" href="${game.link}">${game.title}</a></li>`;
  })

  page = page.replace("{{unit.games}}", gameText);

  const linkData = data["links"];
  let linkText = "";

  linkData.forEach(link => {
    linkText += `<li><a target="_blank" href="${link["link"]}">${link.title}</a></li>`
  })

  page = page.replace("{{unit.links}}", linkText);

  const vidData = data["videos"];
  let vidText = "";

  vidData.forEach(vid => {
    vidText += `<div class="video-container">`
      vidText += `<div class="video-header">`
        vidText += `<h3>${vid.title}</h3>`
        vidText += `<a target="_blank" href="https://www.youtube.com/watch?v=${vid.link}"></a>`
      vidText += `</div>`;
      vidText += genVideoEmbed(vid.link);
    vidText += `</div>`
  })

  page = page.replace("{{unit.videos}}", vidText)

  return page;
}


// function to generate course content
function genCourse(courseSlug, data) {
  let page = courseTemplate;

  const navPath = resolve("src", data["nav"] + ".json");
  const navData = JSON.parse(readFileSync(navPath, 'utf-8'));
  const pagePath = courseSlug.split("/")

  page = page.replace("{{nav.courses}}", navCourses)
  page = page.replaceAll("{{course.title}}", navData.title)
  page = page.replaceAll("{{course.slug}}", pagePath[0]);
  page = page.replaceAll("{{page.title}}", navData.title);

  let navText = "";
  navData.units.forEach(unit => {
    navText += `<li class="item"><a href="/${navData.course}/${unit.slug}">${unit.prefix}: ${unit.title}</a></li>`;
  })

  if (navData.units.at(-1).hasOwnProperty("lessons")) {
    page = page.replace("{{navigation.previous}}", `/${navData.course}/${navData.units.at(-1).slug}/${navData.units.at(-1).lessons.at(-1).slug}`);
  } else {
    page = page.replace("{{navigation.previous}}", `/${navData.course}/${navData.units.at(-1).slug}`)
  }
  
  page = page.replace("{{navigation.next}}", `/${navData.course}/${navData.units[0].slug}`)

  page = page.replace("{{navigation}}", navText);

  page = page.replace("{{course.summary}}", data["summary"])



  const gameData = data["games"]
  let gameText = "";

  gameData.forEach(game => {
    gameText += `<li><a target="_blank" href="${game.link}">${game.title}</a></li>`;
  })

  page = page.replace("{{course.games}}", gameText);

  const linkData = data["links"];
  let linkText = "";

  linkData.forEach(link => {
    linkText += `<li><a target="_blank" href="${link["link"]}">${link.title}</a></li>`
  })

  page = page.replace("{{course.links}}", linkText);

  page = page.replace("{{course.exam-date}}", examDates[navData.title].date + " at " + examDates[navData.title].time);

  return page;
}

function genVideoEmbed(link) {
  return `<iframe class="video-embed" src="https://www.youtube-nocookie.com/embed/${link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}