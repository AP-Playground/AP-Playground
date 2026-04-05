import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'
import * as memory from './memory.js'
import * as pinpoint from './pinpoint.js'


memory.upload()
pinpoint.upload()


export function upload() {
  const gamesData = JSON.parse(readFileSync("src/games/home.json", "utf-8"))
  let page = templates.head(gamesData.title, "/games", "", ["/css/list.css"], ["/js/list.js"])
  page += "<body>"
  page += templates.nav("/games");

  page += `<div class="page-wrapper">`

    page += templates.header("/games");

      page += "<main>"

      page += templates.block(gamesData.intro.title, `<p>${gamesData.intro.content}</p><input id="list-search" type="text" placeholder="Search for a game">`, true)

      let temp = global.games.map(({title, slug}) => {
        let header = `<div class="split-header">`
        header += `<h2>${title}:</h2>`
        header += `<a href="/games/${slug}">Play &rightarrow;</a>`
        header += `</div>`
        const gameData = JSON.parse(readFileSync(`src/games/${slug}.json`,"utf-8"))
        let content = "<p>" + gameData.description + "</p>"
        content += `<img src="${gameData.image}" class="background-image">`
        return templates.block(header, content)
      })
      temp.push(templates.block(`<p>${gamesData["no-match"]}</p>`, "", false, ["hidden"]))
      page += templates.doubleBlock(temp.join(""), ["list-container"])

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("games.html", page, true);
}
