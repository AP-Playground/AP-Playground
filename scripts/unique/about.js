import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'

export function upload() {
  const aboutData = JSON.parse(readFileSync("src/unique/about.json", "utf-8"))
  let page = templates.head(aboutData.title)
  page += "<body>"
  page += templates.nav("/about");

  page += `<div class="page-wrapper">`

    page += templates.header("/about");

      page += "<main>"

      let temp = templates.block(aboutData.intro.title, aboutData.intro.content, true)
      temp += templates.block(aboutData.mission.title, aboutData.mission.content)
      page += templates.doubleBlock(temp)
      
      page += templates.block(aboutData.usage.title, aboutData.usage.content.map(i => `<p>${i}</p>`).join(""))

      page += templates.block(aboutData.contact.title, aboutData.contact.content.map(i => `<p>${i}</p>`).join(""))

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("about.html", page, true);
}