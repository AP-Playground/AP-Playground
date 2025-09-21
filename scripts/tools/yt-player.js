import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

const slug = 'yt-player'

export function upload() {
  const data = JSON.parse(readFileSync(`src/tools/${slug}.json`, "utf-8"))
  let page = templates.head(global.toolTitle(slug), "", [`/css/tools/${slug}.css`], [`/js/tools/${slug}.js`])
  page += "<body>"
  page += templates.nav("/tools/" + slug);

  page += `<div class="page-wrapper">`

    page += templates.header("/tools/" + slug);

      page += "<main>"

      page += templates.block(global.toolTitle(slug), `<p>${data.description}</p><input id="url-input" type="text" placeholder="https://youtube.com/watch?v=...">`, true)

      page += templates.block(templates.videoEmbed(""), `<div class="overlay">${data.instructions}</div>`, false, ["video-block"])

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"

  util.writeFile("/tools/yt-player.html", page, true);
}