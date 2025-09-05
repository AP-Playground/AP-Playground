import * as templates from '../templates.js'

export function block() {
  let content = `<div class="flashcard" tabindex="0" role="button">`
    content += `<div class="flashcard-front"><h2>Loading&hellip;</h2></div>`
    content += `<div class="flashcard-back"><p></p><img></div>`
  content += `</div>`

  content += `<div class="flashcard-controls">`
    content += `<div class="left"><button class="shuffle"><img src="/icons/shuffle.svg"></button><button class="swap"><img src="/icons/swap.svg"></button></div>`
    content += `<div class="center"><button class="prev">	
<img src="/icons/previous.svg"></button><p class="progress"></p><button class="next"><img src="/icons/next.svg"></button></div>`
    content += `<div class="right"><button class="fullscreen"><img src="/icons/maximize.svg"></button></div>`
  content += `</div>`

  return templates.block("", content, false, ["flashcard-block"]);
}