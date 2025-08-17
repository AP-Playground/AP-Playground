import * as global from "./global.js"
import { readFileSync } from "fs";

function breadcrumbs(...links) {
  let breadcrumbs = `<nav aria-label="Breadcrumb" class="breadcrumbs"><ol>`;
  let length = links.length
  breadcrumbs += links.map(([title, link], idx) => {
    return `<li><a href="${link}"${idx === length - 1 ? 'aria-current="page"' : ""}>${title}</a></li>`
  }).join("")
  breadcrumbs += `</ol></nav>`
  return breadcrumbs;
}

export function head(title, description = "", stylesheets = [], scripts = []) {
  let head = `<head>`
  head += `<meta charset="UTF-8">`
  head += `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  head += `<title>${title} | AP Playground</title>`
  if (description) head += `<meta name="description" content="${description}">`
  head += `<link rel="icon" href="/icons/favicon.png">`
  head += `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="preload stylesheet" as="style">`
  head += `<link href="/css/general.css" rel="stylesheet">`
  head += stylesheets.map(css => `<link href="${css}" rel="stylesheet">`).join("")
  head += `<script src="/js/setup.js"></script>`
  head += scripts.map(js => `<script src="${js}"></script>`).join("")
  head += `</head>`
  return head;
}

export function block(title, content, intro = false, classes = []) {
  classes = classes.map(i => ` ${i}`).join('')
  if (content[0] !== "<") content = `<p>${content}</p>`
  if (intro) {
    if (title[0] !== "<") title = `<h1>${title}</h1>`
    return `<section class="content-block intro-block${classes}">${title}${content}</section>`
  } else {
    if (title[0] !== "<") title = `<h2>${title}</h2>`
    return `<section class="content-block${classes}">${title}${content}</section>`
  }
}

export function doubleBlock(content, classes = []) {
  return `<div class="double-content-block${classes.map(i => ` ${i}`).join('')}">${content}</div>`
}

export function footer() {
  let footer = `<footer>`
  footer += `<nav>`
    footer += `<a href="mailto:dakacorporation2@gmail.com">Contact Us</a>`
    footer += `<a href="https://docs.google.com/forms/d/e/1FAIpQLSd2hNIyCBl1jcndz5vX2f5sTx2hDI3-NY_vkbOfJHKgFAnpcA/viewform">Feedback</a>`
    footer += `<a href="https://www.youtube.com/@ap-playground">Youtube</a>`
  footer += `</nav>`
  footer += `<div class="disclaimer">AP and Advanced Placement are trademarks registered by the College Board, which is not affiliated with, and does not endorse, this site.</div>`
  footer += `</footer>`
  return footer;
}

export function nav(path) {
  let side = `<div class="side-nav">`
  side += `<div class="side-nav-background"></div>`
  side += `<header class="side-nav-header">`
  side += `<div class="side-nav-logo"><img src="/icons/logo.svg" alt="AP Playground Logo"></div>`
  side += `<button class="side-nav-btn"><div></div></button>`
  side += "</header>"
  side += `<div class="side-nav-links"><nav>`

  side += navTab(path, "Home", "/")
  side += navTab(path, "About", "/about")

  side += `<hr class="side-nav-divider">`

  side += navTab(path, "Courses", "/courses", global.navCourses, transitionDuration(global.courses.length))
  side += navTab(path, "Games", "/games", 'Games are not supported at this time', transitionDuration(1))

  side += `<hr class="side-nav-divider">`

  const pathSegments = path.split("/")
  pathSegments.shift()
  switch (pathSegments[0]) {
    case "":
    case "about":
    case "404":
    case "courses": {
      side += `<img src="/icons/favicon.svg" class="side-nav-back-img">`
      break;
    }
    case "games": {
      if (pathSegments.length === 1) {
        side += `<img src="/icons/favicon.svg" class="side-nav-back-img">`
      }
      break;
    }
    default: {
      const navData = JSON.parse(readFileSync(`src/nav/${pathSegments[0]}.json`))
      let tabContent = []
      for (const [unitSlug, unit] of Object.entries(navData.data)) {
        const unitLink = "/" + navData.slug + "/" + unitSlug
        tabContent.push(`<li class="item"><a href="${unitLink}"${path === unitLink ? " aria-current='page'" : ""}>${unit.prefix + ": " + unit.title}</a></li>`)
        if (pathSegments[1]===unitSlug) {
          for (const [lessonSlug, lesson] of Object.entries(navData.data[unitSlug].data)) {
            const lessonLink = "/"+navData.slug+"/"+unitSlug+"/"+lessonSlug
            tabContent.push(`<li class="sub-item"><a href="${lessonLink}"${path === lessonLink ? " aria-current='page'" : ""}>${lesson.prefix + ": " + lesson.title}</a></li>`)
          }
        }
      }
      side += navTab(path, navData.title, `/${navData.slug}`, tabContent.join(""), transitionDuration(tabContent.length))

    }
  }

  side += `</nav></div>`
  side += `</div>`
  return side;
}

function navTab(path, title, link, content = "", duration = 0) {
  const pathSegments = path.split("/");
  pathSegments.shift()
  let temp = `<div class="side-nav-tab${("/" + pathSegments[0]) === link && content ? " open" : ""}">`;
  if (content) {
    temp += `<div class="accordion-header"><h2><a href="${link}"${path === link ? " aria-current='page'" : ""}>${title}</a></h2><button class="accordion-btn"><div></div></button></div>`
    temp += `<div class="accordion-content" style="transition-duration: ${duration}">`
    temp += `<div>`
    temp += `<hr><ul>`
    temp += content;
    temp += `</ul>`
    temp += `</div>`
    temp += `</div>`
  } else {
    temp += `<h2><a href="${link}"${path === link ? " aria-current='page'" : ""}>${title}</a></h2>`
  }
  temp += `</div>`
  return temp
}

function transitionDuration(itemCount) {
  return (0.47 + 0.03*itemCount) + "s";
}

export function header(path) {
  const pathSegments = path.split("/")
  pathSegments.shift()

  let navData;

  let temp = `<div class="page-header">`

  let breadcrumb = [["Home","/"]]

  switch (pathSegments[0]) {
    case "": {
      breadcrumb = []
      break;
    }
    case "about": {
      breadcrumb.push(["About","/about"])
      break;
    }
    case "courses": {
      breadcrumb.push(["Courses","/courses"])
      break;
    }
    case "games": {
      breadcrumb.push(["Games","/games"])
      break;
    }
    case "404": {
      breadcrumb = []
      break;
    }
    default: {
      breadcrumb.push(["Courses","/courses"])
      navData = JSON.parse(readFileSync(`src/nav/${pathSegments[0]}.json`))

      breadcrumb.push([navData.title,"/" + pathSegments[0]])

      if (pathSegments.length > 1) {
        const unit = navData.data[pathSegments[1]]
        breadcrumb.push([unit.prefix+": "+unit.title, `/${pathSegments[0]}/${pathSegments[1]}`])
      }
      if (pathSegments.length > 2) {
        const lesson = navData.data[pathSegments[1]].data[pathSegments[2]]
        breadcrumb.push([lesson.prefix+": "+lesson.title, `/${pathSegments[0]}/${pathSegments[1]}/${pathSegments[2]}`])
      }
    }
  }
  temp += breadcrumbs(...breadcrumb)

  temp += `<div class="page-controls">`
  switch (pathSegments[0]) {
    case "":
    case "about":
    case "courses":
    case "404":
    case "games": {
      break;
    }
    default: {
      temp += `<nav aria-label="pagination">`
      temp += `<ul>`

      let nextLink;
      let prevLink;

      const units = Object.entries(navData.data)

      if (pathSegments.length === 1) {
        nextLink = "/" + pathSegments[0] + "/" + units[0][0]
        
      } else if (pathSegments.length === 2) {
        const curUnit = units.findIndex(([unitSlug, unit]) => unitSlug === pathSegments[1])
        if (curUnit === 0) {
          prevLink = "/" + pathSegments[0]
        } else if (units[curUnit - 1][1].hasOwnProperty("data")) {
          const lessons = Object.entries(units[curUnit - 1][1].data)
          prevLink = "/" + pathSegments[0] + "/" + units[curUnit - 1][0] + "/" + lessons[lessons.length - 1][0]
        } else {
          prevLink = "/" + pathSegments[0] + "/" + units[curUnit - 1][0]
        }
        if (units[curUnit][1].hasOwnProperty("data")) {
          const lessons = Object.entries(units[curUnit][1].data)
          nextLink = "/" + pathSegments[0] + "/" + units[curUnit][0] + "/" + lessons[0][0]
        } else if (curUnit !== units.length - 1) {
          nextLink = "/" + pathSegments[0] + "/" + units[curUnit + 1][0]
        }

      } else if (pathSegments.length === 3) {
        const curUnit = units.findIndex(([unitSlug, unit]) => unitSlug === pathSegments[1])
        const lessons = Object.entries(units[curUnit][1].data)
        const curLesson = lessons.findIndex(([lessonSlug, lesson]) => lessonSlug === pathSegments[2])

        if (curLesson === 0) {
          prevLink = "/" + pathSegments[0] + "/" + units[curUnit][0];
        } else {
          prevLink = "/" + pathSegments[0] + "/" + units[curUnit][0] + "/" + lessons[curLesson - 1][0]
        }

        if (curLesson !== lessons.length - 1) {
          nextLink = "/" + pathSegments[0] + "/" + units[curUnit][0] + "/" + lessons[curLesson + 1][0]
        } else if (curUnit !== units.length - 1) {
          nextLink = "/" + pathSegments[0] + "/" + units[curUnit + 1][0]
        }
      }

      if (prevLink) {
        temp += `<li><a href="${prevLink}" rel="prev"><</a></li>`
      }
      if (nextLink) {
        temp += `<li><a href="${nextLink}" rel="next">></a></li>`
      }

      temp += `</ul></nav>`
    }
  }

  temp += `<button class="dark-mode-btn"><div></div></button>`

  temp += "</div>"

  temp += "</div>"

  return temp;
}



export function video({title, link, more = false, download = false, filename = false}, path) {
  if (download) {
    if (typeof download === 'boolean') {
      download = "/slides" + path + ".pptx"
    }
    if (filename) {
      filename = `="${filename}"`
    }
    return `<div class="video-container"><div class="video-header split-header"><h3>${title}</h3><div class="video-header-btns"><a class="download" aria-label="Download the presentation" download${filename} href="${download}"></a><a class="external-open" target="_blank" aria-label="Open video in new tab" href="https://www.youtube.com/watch?v=${link}"></a></div></div>${more ? moreVideoEmbed(link) : videoEmbed(link)}</div>`
  } else {
    return `<div class="video-container"><div class="video-header split-header"><h3>${title}</h3><div class="video-header-btns"><a class="external-open" aria-label="Open video in new tab" target="_blank" href="https://www.youtube.com/watch?v=${link}"></a></div></div>${more ? moreVideoEmbed(link) : videoEmbed(link)}</div>`
  }
}

function videoEmbed(link) {
  return `<iframe class="video-embed" src="https://www.youtube-nocookie.com/embed/${link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

function moreVideoEmbed(link) {
  return `<iframe class="video-embed unloaded" data-src="https://www.youtube-nocookie.com/embed/${link}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}