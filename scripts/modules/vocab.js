import * as templates from '../templates.js'

export function createBlock(vocab) {
  // let content = vocab.map(i => "<li>" + i.term + "</li>").join("")
  // content = `<ul>${content}</ul>`


  return templates.block("Flashcard block", "", false, ["flashcards-block"])
}