import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'
import * as ytPlayer from './yt-player.js'


ytPlayer.upload()


export function upload() {
  const toolsData = JSON.parse(readFileSync("src/tools/home.json", "utf-8"))
  let page = templates.head(toolsData.title, "/tools", "", ["/css/list.css"], ["/js/list.js"])
  page += "<body>"
  page += templates.nav("/tools");

  page += `<div class="page-wrapper">`

    page += templates.header("/tools");

      page += "<main>"

      page += templates.block(toolsData.intro.title, `<p>${toolsData.intro.content}</p><input id="list-search" type="text" placeholder="Search for a tool">`, true)

      let temp = global.tools.map(({title, slug}) => {
        let header = `<div class="split-header">`
        header += `<h2>${title}:</h2>`
        header += `<a href="/tools/${slug}">Use &rightarrow;</a>`
        header += `</div>`
        const toolData = JSON.parse(readFileSync(`src/tools/${slug}.json`,"utf-8"))
        let content = "<p>" + toolData.description + "</p>"
        content += `<img src="${toolData.image}" class="background-image">`
        return templates.block(header, content)
      })
      temp.push(templates.block(`<p>${toolsData["no-match"]}</p>`, "", false, ["hidden"]))
      page += templates.doubleBlock(temp.join(""), ["list-container"])

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("tools.html", page, true);
}
