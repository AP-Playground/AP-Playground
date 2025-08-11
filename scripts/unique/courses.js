import * as templates from '../templates.js'
import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as global from '../global.js'

export function upload() {
  const coursesData = JSON.parse(readFileSync("src/unique/courses.json", "utf-8"))
  let page = templates.head(coursesData.title, "", ["/css/courses.css"], ["/js/courses.js"])
  page += "<body>"
  page += templates.nav("/courses");

  page += `<div class="page-wrapper">`

    page += templates.header("/courses");

      page += "<main>"

      page += templates.block(coursesData.intro.title, `<p>${coursesData.intro.content}</p><input id="course-search" type="text" placeholder="Search for a course">`, true)

      let temp = global.courses.map(({title, slug}) => {
        let header = `<div class="split-header">`
        header += `<h2>${title}:</h2>`
        header += `<a href="/${slug}">Course &rightarrow;</a>`
        header += `</div>`
        let content = "<p>" + JSON.parse(readFileSync(`src/${slug}/index.json`,"utf-8")).summary + "</p>"
        content += `<h3>Exam Date: ${global.examDate(title)}</h3>`
        return templates.block(header, content)
      })
      temp.push(templates.block(`<p>${coursesData["no-match"]}</p>`, "", false, ["hidden"]))
      page += templates.doubleBlock(temp.join(""), ["courses-container"])

      page += `</main>`

    page += templates.footer()
  
  page += `</div>`
  page += "</body>"
  util.writeFile("courses.html", page, true);
}
