import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';

export function upload(path, title) {
  const data = JSON.parse(readFileSync(`src${path}/index.json`))
  let page = templates.head(title)
  page += `<body>`
  page += templates.nav(path)
  page += `<div class="page-wrapper">`

  page += templates.header(path)


  page += `<main>`

  const examDate = "<h3>" + global.examDate(title) + "</h3>";
  page += templates.block(title, `<p>${data.summary}</p>`+examDate, true)

  const gameText = data["games"].map(i => `<li><a target="_blank" href="${i.link}">${i.title}</a></li>`)
  const gameBlock = templates.block("Games:", `<ul class="games-list">${gameText.join("")}</ul>`);

  const linkText = data["links"].map(i => `<li><a target="_blank" href="${i.link}">${i.title}</a></li>`)
  const linkBlock = templates.block("Resources:", `<ul class="resources-list">${linkText.join("")}</ul>`);

  page += templates.doubleBlock(gameBlock + linkBlock)

  page += `</main>`


  page += templates.footer()

  page += `</div>`
  page += `</body>`

  util.writeFile(path + ".html", page, true)
}