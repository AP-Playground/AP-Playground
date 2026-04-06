import * as templates from '../templates.js'

export function block() {
  let card = `<div class="flashcard front" tabindex="0" role="button">`
    card += `<div class="flashcard-front"><h2>Loading&hellip;</h2></div>`
    card += `<div class="flashcard-back"><div></div><img></div>`
  card += `</div>`

  let controls = `<div class="module-controls">`
    controls += `<div class="left"><button class="shuffle"><img src="/icons/shuffle.svg"></button><button class="swap"><img src="/icons/swap.svg"></button></div>`
    controls += `<div class="center"><button class="prev">	
<img src="/icons/previous.svg"></button><p class="progress"></p><button class="next"><img src="/icons/next.svg"></button></div>`
    controls += `<div class="right"><button class="fullscreen"><img src="/icons/maximize.svg"></button></div>`
  controls += `</div>`

  return templates.block(card, controls, false, ["flashcard-block"]);
}