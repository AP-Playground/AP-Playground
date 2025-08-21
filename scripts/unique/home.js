import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

export function upload() {
  const homeData = JSON.parse(readFileSync("src/unique/home.json", "utf-8"))
  let page = templates.head(homeData.title, "", ["/css/home.css"])
  page += "<body>"
  page += templates.nav("/");

  page += `<div class="page-wrapper">`

    page += templates.header("/");

      page += "<main>"

      let title = `<img src="/icons/logo.svg" alt="AP Playground Logo">`
      title += `<h1 class="visually-hidden">AP Playground</h1>`
      title += `<h2>"${homeData.slogan}"</h2>`
      let content = homeData.features.map(i => "<li>"+i+"</li>").join("")
      content = `<ul class="features">${content}</ul>`
      page += templates.block(title, content, true)


      let courseExplore = templates.block(header(homeData.courses.title,"/courses"), homeData.courses.content);
      let gamesExplore = templates.block(header(homeData.games.title,"/games"), homeData.games.content);
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
