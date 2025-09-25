import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

const slug = 'yt-player'

export function upload() {
  const data = JSON.parse(readFileSync(`src/tools/${slug}.json`, "utf-8"))
  let page = templates.head(global.toolTitle(slug), "", [`/css/tools/${slug}.css`,"/css/module.css"], ['/js/fullscreen.js',`/js/tools/${slug}.js`])
  page += "<body>"
  page += templates.nav("/tools/" + slug);

  page += `<div class="page-wrapper">`

    page += templates.header("/tools/" + slug);

      page += "<main>"

      page += templates.block(global.toolTitle(slug), `<p>${data.description}</p><input id="url-input" type="text" placeholder="https://youtube.com/watch?v=...">`, true)

      let temp = templates.videoEmbed("")
      temp += `<div class="module-controls">`
        temp += `<div class="left"><button class="copy-link"><img src="/icons/copy_link.svg"></button></div>`
        temp += `<div class="center"></div>`
        temp += `<div class="right"><button class="fullscreen"><img src="/icons/maximize.svg"></button></div>`
      temp += `</div>`
      page += templates.block(temp, `<div class="overlay">${data.instructions}</div>`, false, ["video-block"])

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"

  util.writeFile("/tools/yt-player.html", page, true);
}