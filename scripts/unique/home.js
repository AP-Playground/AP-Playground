import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

export function upload() {
  let page = templates.head("Home", "", ["/css/home.css"])
  page += "<body>"
  page += templates.nav("/");

  page += `<div class="page-wrapper">`

    page += templates.header("/");

      page += "<main>"

      let title = `<img src="/icons/logo.svg" alt="AP Playground Logo">`
      title += `<h1 class="visually-hidden">AP Playground</h1>`
      title += `<h2>"Play hard. Score harder"</h2>`
      let content = ["Unit reviews", "Practice games", "Vocab sets", "Resource library"].map(i => "<li>"+i+"</li>").join("")
      content = `<ul class="features">${content}</ul>`
      page += templates.block(title, content, true)


      let courseExplore = templates.block(header("Explore our courses","/courses"),"So far, we have a completed AP Biology course. Vocab review sets for AP Biology are in the works, alongside content for Art History, World History, Physics, and many more!");
      let gamesExplore = templates.block(header("Explore our games","/games"),"Games are not supported at this time");
      page += templates.doubleBlock(courseExplore + gamesExplore)

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("index.html", page, true);
}

function header(title, link) {
  let temp = "<h2>" + title + "</h2>"
  temp += `<a href="${link}">More &rightarrow;</a>`
  return `<div class="split-header">${temp}</div>`
}
