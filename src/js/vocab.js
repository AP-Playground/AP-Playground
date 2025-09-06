const vocabContainer = document.querySelector(".vocab-cards")

vocab.forEach(({term, link, definition, image}) => {
  let cardText = `<h2>${term} <a href="${link}" class="external-open" aria-label="Learn more about ${term}" target="_blank"></a></h2>` + `<p>${definition}</p>`
  cardText = `<div class="vocab-content-container">` + cardText + "</div>"
  let imageText = "";
  if (image) {
    imageText = `<img class="vocab-img" src="${image}">`
    imageText += `<img class="magnify" src="/icons/magnify.svg">`;
    imageText =  `<div class="vocab-img-container">${imageText}</div>`
  }
  let out = cardText + imageText;
  out = `<div class="vocab-card content-block">${out}</div>`
  vocabContainer.insertAdjacentHTML("beforeend", out)
})

const vocabCards = document.querySelectorAll(".vocab-card");
const vocabCardImages = document.querySelectorAll(".vocab-card img");

vocabCardImages.forEach(img => {
  const imgEnlarged = document.querySelector(".img-enlarged-container > img");
  img.addEventListener("click", e => {
    imgEnlarged.src = "";
    imgEnlarged.src = img.src;
  })
})

const flashcardBlock = document.querySelector(".flashcard-block")
const flashcardContainer = flashcardBlock.querySelector(".flashcard")
const flashcardTitle = flashcardContainer.querySelector(".flashcard-front h2")
const flashcardText = flashcardContainer.querySelector(".flashcard-back p")
const flashcardImage = flashcardContainer.querySelector(".flashcard-back img")

const flashcardControls = flashcardBlock.querySelector(".flashcard-controls")
const flashcardShuffle = flashcardControls.querySelector(".shuffle")
const flashcardSwap = flashcardControls.querySelector(".swap")
const flashcardPrev = flashcardControls.querySelector(".prev")
const flashcardNext = flashcardControls.querySelector(".next")
const flashcardMaximize = flashcardControls.querySelector(".fullscreen")
const flashcardProgress = flashcardControls.querySelector(".progress")

let flashcardCurrentIdx = 0;
let flashcardSideDefault = true;

let shuffledVocab = [...vocab];
let shuffled = false;

setFlashcardIdx(0)
flashcardPrev.disabled = true;
if (vocab.length <= 1) flashcardNext.disabled = true;

function loadCard({term, link, definition, image}) {

  flashcardProgress.textContent = (flashcardCurrentIdx + 1) + " / " + vocab.length;

  flashcardTitle.textContent = term;
  flashcardText.textContent = definition;
  if (image) flashcardImage.src = image;
  flashcardImage.hidden = !image;

  
  flashcardContainer.style.transition = "none";
  if (flashcardSideDefault) {
    flashcardContainer.classList.add("front")
  } else {
    flashcardContainer.classList.remove("front")
  }
  requestAnimationFrame(() => {
    flashcardContainer.style.transition = "";
  })
}

flashcardContainer.addEventListener("click", (event) => {
  if (event.target === flashcardImage) return;

  flashcardContainer.classList.toggle("front")
})

flashcardContainer.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();

    flashcardContainer.classList.toggle("front")
  }
  if (event.key === "ArrowLeft") {
    setFlashcardIdx(flashcardCurrentIdx - 1)
  }
  if (event.key === "ArrowRight") {
    setFlashcardIdx(flashcardCurrentIdx + 1)
  }
})


flashcardShuffle.addEventListener("click", () => {
  shuffled = !shuffled;
  shuffleArray(shuffledVocab);
  setFlashcardIdx(0)
  flashcardShuffle.classList.toggle("active")
})


flashcardSwap.addEventListener("click", () => {
  flashcardSideDefault = !flashcardSideDefault;
  flashcardSwap.classList.toggle("active")
  flashcardContainer.classList.toggle("front")
})


flashcardPrev.addEventListener("click", () => {
  setFlashcardIdx(flashcardCurrentIdx - 1)
})


flashcardNext.addEventListener("click", () => {
  setFlashcardIdx(flashcardCurrentIdx + 1)
})

flashcardMaximize.addEventListener("click", () => {
  flashcardMaximize.classList.toggle("active");
  toggleFullscreen(flashcardBlock, flashcardMaximize)
})

flashcardImage.addEventListener("click", () => {
  const imgEnlarged = document.querySelector(".img-enlarged-container > img");
  imgEnlarged.src = "";
  imgEnlarged.src = flashcardImage.src;
})

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function setFlashcardIdx(idx) {
  if (idx < 0) return;
  if (idx >= vocab.length) return;

  flashcardCurrentIdx = idx

  flashcardPrev.disabled = idx === 0;
  flashcardNext.disabled = idx === vocab.length - 1;

  if (shuffled) loadCard(shuffledVocab[flashcardCurrentIdx])
  else loadCard(vocab[flashcardCurrentIdx])
}