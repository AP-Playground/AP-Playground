import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';

export function upload(path, title, nav) {
  const pathSegments = path.split("/")
  pathSegments.shift()

  const data = JSON.parse(readFileSync(`src${path}/index.json`))

  let page = templates.head(title)
  page += `<body>`
  page += templates.nav(path)
  page += `<div class="page-wrapper">`

  page += templates.header(path)


  page += `<main>`

    const ced = `<sup>(<a target="_blank" href="${global.ced(pathSegments[0])}">${global.courseTitle(pathSegments[0])} CED</a>)</sup>`
    page += templates.block(title, data.summary + ced, true);
    
    const quickLinks = Object.entries(nav.data).map(([unitSlug, unit]) => 
      `<li><a href="${path}/${unitSlug}">${unit.prefix}</a></li>`
    )
    page += `<ul class="quick-links">` + quickLinks.join("") + "</ul>"
    
    const gameText = data["games"].map(i => `<li><a target="_blank" href="${i.link}">${i.title}</a></li>`)
    const gameBlock = templates.block("Games:", `<ul class="link-list">${gameText.join("")}</ul>`);

    const linkText = data["links"].map(i => `<li><a target="_blank" href="${i.link}">${i.title}</a></li>`)
    const linkBlock = templates.block("Resources:", `<ul class="link-list">${linkText.join("")}</ul>`);

    page += templates.doubleBlock(gameBlock + linkBlock)


    const vidData = data["videos"];
    const vidText = vidData.filter(vid => !vid.hasOwnProperty("more") || !vid.more).map(vid => templates.video(vid, path)).join("")
    let moreVidText = vidData.filter(vid => vid.hasOwnProperty("more") && vid.more).map(vid => templates.video(vid, path)).join("")

    if (moreVidText) {
      moreVidText = `<div class="more-container"><div>${moreVidText}</div></div>`
      moreVidText += `<button class="more-btn"><span class="more">&darr; More Videos &darr;</span><span class="less">&uarr; Less Videos &uarr;</span></button>`
    }

    page += templates.block("Videos:", vidText + moreVidText)


  page += `</main>`


  page += templates.footer()

  page += `</div>`
  page += `</body>`

  util.writeFile(path + ".html", page, true)
}