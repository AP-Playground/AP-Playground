import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';
import * as vocabGenerator from '../modules/vocab.js'

export function upload(path, title, vocab) {

  let page = templates.head("Vocab | " + title, "", ["/css/vocab.css"],["/js/vocab.js"])
  page += `<body>`
  page += templates.nav(path + "/vocab")
  page += `<div class="page-wrapper">`
  
    page += templates.header(path + "/vocab")
  
  
    page += `<main>`
    
    let temp = templates.splitHeader("Vocabulary", path, "Back &rightarrow;", true)
    page += templates.block(temp, title, true)


    page += vocabGenerator.create(vocab)


    page += `</main>`
  
  
    page += templates.footer()

  page += `</div>`
  page += `</body>`

  util.writeFile(path + "/vocab.html", page, true)
}
