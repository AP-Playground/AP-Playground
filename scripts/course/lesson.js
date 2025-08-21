import { readFileSync } from 'fs';
import * as util from '../util.js'
import * as templates from '../templates.js'
import * as global from '../global.js';
import * as vocab from './vocab.js'

export function upload(path, title) {
  const pathSegments = path.split("/")
  pathSegments.shift()

  const data = JSON.parse(readFileSync(`src${path}.json`))

  let page = templates.head(title)
  page += `<body>`
  page += templates.nav(path)
  page += `<div class="page-wrapper">`

  page += templates.header(path)


  page += `<main>`

  page += templates.block(title, data.summary, true);

  const vocabCount = data["vocab"].length;
  let vocabText = `<ol class="vocab-grid" style="--row-count:${Math.ceil(vocabCount/2)};--row-count-3:${Math.ceil(vocabCount/3)};">` 
  vocabText += data["vocab"].map(i => `<li><a target="_blank" href="${i.link}">${i.term}</a></li>`).join("")
  vocabText += `</ol>`
  vocab.upload(path, title, data["vocab"])

  const vocabHeader = `<div class="split-header"><h2>Vocabulary:</h2><a href="${path}/vocab">Practice &rightarrow;</a></div>`
  const vocabBlock = templates.block(vocabHeader, vocabText)

  const linkText = data["links"].map(i => `<li><a target="_blank" href="${i.link}">${i.title}</a></li>`)
  const linkBlock = templates.block("Resources:", `<ul class="resources-list">${linkText.join("")}</ul>`);

  page += templates.doubleBlock(vocabBlock + linkBlock)

  
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