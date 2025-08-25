import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';
import * as vocabGenerator from '../modules/vocab.js'

export function upload(path, title, vocab) {

  let page = templates.head("Vocab for " + title, "", ["/css/vocab.css"],["/js/vocab.js"])
  page += `<body>`
  page += templates.nav(path + "/vocab")
  page += `<div class="page-wrapper">`
  
    page += templates.header(path + "/vocab")
  
  
    page += `<main>`
    
    let temp = templates.splitHeader("Vocabulary", path, "Back &rightarrow;", true)
    page += templates.block(temp, title, true)


    page += vocabGenerator.create(vocab)


    temp = vocab.map(({term, link, definition, image}) => {
      let cardText = `<h2>${term} <a href="${link}" class="external-open" aria-label="Learn more about ${term}" target="_blank"></a></h2>` + `<p>${definition}</p>`
      cardText = "<div>" + cardText + "</div>"
      return templates.block(cardText, (image ? `<img src="${image}">` : ""), false, ["vocab-card"])
    });
    page += templates.doubleBlock(temp.join(""))

    page += `</main>`
  
  
    page += templates.footer()

  page += `</div>`

  page += templates.imgEnlargedContainer()

  page += `</body>`

  util.writeFile(path + "/vocab.html", page, true)
}
