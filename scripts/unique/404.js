import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

export function upload() {
  let page = templates.head("Home", "", ["/css/home.css"])
  page += "<body>"
  page += templates.nav("/404");

  page += `<div class="page-wrapper">`

    page += templates.header("/404");

      page += "<main>"

      page += templates.block("404 error", "The page you are attempting to reach does not exist, or has not yet been published", true)

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("404.html", page, true);
}