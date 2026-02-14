import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

const slug = "memory";

export function upload() {
    const data = JSON.parse(readFileSync(`src/games/${slug}.json`, "utf-8"))
    let page = templates.head(global.gameTitle(slug), "/games/" + slug, "", [`/css/games/${slug}.css`,`/css/games/general.css`,"/css/module.css"], ['/js/fullscreen.js',`/js/games/${slug}.js`])
    page += "<body>"
    page += templates.nav("/games/" + slug);

    page += `<div class="page-wrapper">`

    page += templates.header("/games/" + slug);

        page += "<main>"

        page += templates.block(global.gameTitle(slug), `<p>${data.description}</p><select id="course-select"><option selected value>Select a course</option>${data.courses.map((i => `<option value="${i}">${global.courseTitle(i)}</option>`))}</select>`, true)

        page += `<div class="game-filters"></div>`
        page += `<div class="game-options"></div>`
        page += `<div class="game-settings" hidden>${JSON.stringify(data.settings)}</div>`
        
        let temp = `<div class="multiplayer-info"><div></div><div></div><div></div></div>`
        temp += `<div class="game-bound">`
            temp += `<div class="game"></div>`  
            temp += `<div class="win-modal hidden" hidden><h1>Game Over!</h1><p class="win-accuracy"></p><p class="win-time"></p></div>`
        temp += `</div>`
        temp += `<div class="module-controls">`
            temp += `<div class="left"><button class="replay"><img src="/icons/refresh.svg"></button><button class="copy-link"><img src="/icons/copy_link.svg"></button></div>`
            temp += `<div class="center"><div class="progress">0 / 0</div></div>`
            temp += `<div class="right"><button class="fullscreen"><img src="/icons/maximize.svg"></button></div>`
        temp += `</div>`
        page += templates.block(temp, `<div class="overlay">${data.instructions}</div>`, false, ["game-block"])

        page += ``
        
      page += `</main>`

    page += templates.footer()
  
  page += `</div>`

  page += templates.imgEnlargedContainer()

  page += "</body>"

  util.writeFile(`/games/${slug}.html`, page, true);
}