import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';
import * as flashcard from '../modules/flashcard.js'

export function upload(path, title, vocab) {

  let page = templates.head("Vocab for " + title, "", ["/css/vocab.css"],["/js/vocab.js", "/js/fullscreen.js"])
  page += `<body>`
  page += templates.nav(path + "/vocab")
  page += `<div class="page-wrapper">`
  
    page += templates.header(path + "/vocab")
  
  
    page += `<main>`
    
    let temp = templates.splitHeader("Vocabulary", path, "Back &rightarrow;", true)
    page += templates.block(temp, title, true)


    page += flashcard.block()

    page += templates.doubleBlock("", ["vocab-cards"])

    page += `<script>const vocab = ${JSON.stringify(vocab)}</script>`

    page += `</main>`
  
  
    page += templates.footer()

  page += `</div>`

  page += templates.imgEnlargedContainer()

  page += `</body>`

  util.writeFile(path + "/vocab.html", page, true)
}
