import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

const slug = "chronology";

export function upload() {
    const data = JSON.parse(readFileSync(`src/games/${slug}.json`, "utf-8"))
    let page = templates.head(global.gameTitle(slug), "/games/" + slug, "", [`/css/games/general.css`,"/css/module.css", `/css/games/${slug}.css`], ['/js/fullscreen.js','/js/games/general.js',`/js/games/${slug}.js`])
    page += "<body>"
    page += templates.nav("/games/" + slug);

    page += `<div class="page-wrapper">`

    page += templates.header("/games/" + slug);

        page += "<main>"

        page += templates.block(global.gameTitle(slug), `<p>${data.description}</p><select id="course-select"><option selected value>Select a course</option>${data.courses.map((i => `<option value="${i}">${global.courseTitle(i)}</option>`))}</select>`, true)

        page += `<div class="game-filters"></div>`
        page += `<div class="game-options"></div>`
        page += `<div class="game-settings"></div>`
        
        page += `<script>const settingsData = ${JSON.stringify(data.settings)}; const optionsData = ${JSON.stringify(data.options)}; const gameSlug = "${slug}"</script>`
        
        let temp = `<div class="game-bound">`
            temp += `<div class="game">`
              temp += `<div class="game-play-area init">`
                temp += `<div class="term-container">`
                temp += `</div>`
              temp += "</div>"
              temp += `<div class="game-identifiers init">`
                temp += `<h2 class="text-identifier"></h2>`
                temp += `<div class="image-identifier-container" style="display: none"><img class="image-identifier-loading" src="/icons/loading-circle.gif"><img class="image-identifier" draggable="false"><img class="image-identifier-magnify" tabindex="0" src="/icons/magnify.svg"></div>`
                temp += `<div class="hint-container"></div>`
              temp += "</div>"
              temp += `<div class="game-win-modal hidden">`
                temp += `<h1>Game Over!</h1>`
                temp += `<p class="game-score"></p>`
                temp += `<div class="game-win-modal-controls">`
                  temp += `<button class="game-replay">Replay</button>`
                  temp += `<button class="game-review">Review</button>`
                temp += `</div>`
              temp += `</div>`
            temp += `</div>`
        temp += `</div>`
        temp += `<div class="module-controls">`
            temp += `<div class="left"><button class="replay"><img src="/icons/refresh.svg"></button><button class="copy-link"><img src="/icons/copy_link.svg"></button></div>`
            temp += `<div class="center"><div class="progress">0 / 0</div></div>`
            temp += `<div class="right"><button class="fullscreen"><img src="/icons/maximize.svg"></button></div>`
        temp += `</div>`
        page += templates.block(temp, `<div class="overlay">${data.instructions}</div>`, false, ["game-block"])
        
      page += `</main>`

    page += templates.footer()
  
  page += `</div>`

  page += templates.imgEnlargedContainer()

  page += "</body>"

  util.writeFile(`/games/${slug}.html`, page, true);
}