import * as templates from '../templates.js'

export function createBlock(vocab) {
  let content = vocab.map(i => "<li>" + i.term + "</li>").join("")
  content = `<ul>${content}</ul>`


  let header = `Vocab list:`



  return templates.block(header, content, false, ["flashcards-block"])
}