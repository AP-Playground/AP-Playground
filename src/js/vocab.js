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

const flashcardContainer = document.querySelector(".flashcard")
const flashcardTitle = flashcardContainer.querySelector(".flashcard-front h2")
const flashcardText = flashcardContainer.querySelector(".flashcard-back p")
const flashcardImage = flashcardContainer.querySelector(".flashcard-back img")

const flashcardControls = document.querySelector(".flashcard-controls")
const flashcardShuffle = flashcardControls.querySelector(".shuffle")
const flashcardSwap = flashcardControls.querySelector(".swap")
const flashcardPrev = flashcardControls.querySelector(".prev")
const flashcardNext = flashcardControls.querySelector(".next")
const flashcardMaximize = flashcardControls.querySelector(".fullscreen")
const flashcardProgress = flashcardControls.querySelector(".progress")

let flashcardCurrentIdx = 0;
let flashcardFront = true;
let flashcardSideDefault = true;

let shuffledVocab = [...vocab];
let shuffled = false;

loadCard(vocab[flashcardCurrentIdx])
flashcardPrev.disabled = true;
if (vocab.length <= 1) flashcardNext.disabled = true;

function loadCard({term, link, definition, image}) {
  flashcardFront = flashcardSideDefault;

  flashcardProgress.textContent = (flashcardCurrentIdx + 1) + " / " + vocab.length;

  flashcardTitle.textContent = term;
  flashcardText.textContent = definition;
  if (image) flashcardImage.src = image;
  flashcardImage.hidden = !image;

  if (flashcardFront) {
    flashcardContainer.classList.add("front")
  } else {
    flashcardContainer.classList.remove("front")
  }
}

flashcardContainer.addEventListener("click", (event) => {
  if (event.target === flashcardImage) return;
  flashcardFront = !flashcardFront;

  if (flashcardFront) {
    flashcardContainer.classList.add("front")
  } else {
    flashcardContainer.classList.remove("front")
  }
})


flashcardShuffle.addEventListener("click", () => {
  shuffled = !shuffled;
  flashcardCurrentIdx = 0;
  flashcardPrev.disabled = true;
  flashcardNext.disabled = vocab.length - 1 === flashcardCurrentIdx;
  if (shuffled) {
    shuffleArray(shuffledVocab);

    flashcardShuffle.classList.add("active");
    loadCard(shuffledVocab[flashcardCurrentIdx]);
  } else {
    flashcardShuffle.classList.remove("active");
    loadCard(vocab[flashcardCurrentIdx]);
  }
})


flashcardSwap.addEventListener("click", () => {
  flashcardSideDefault = !flashcardSideDefault;
  flashcardFront = !flashcardFront;
  
  if (flashcardSideDefault) {
    flashcardSwap.classList.remove("active")
  } else {
    flashcardSwap.classList.add("active")
  }

  if (flashcardFront) {
    flashcardContainer.classList.add("front")
  } else {
    flashcardContainer.classList.remove("front")
  }
})


flashcardPrev.addEventListener("click", () => {
  flashcardNext.disabled = false;
  flashcardCurrentIdx--;
  if (flashcardCurrentIdx === 0) flashcardPrev.disabled = true;

  if (shuffled) loadCard(shuffledVocab[flashcardCurrentIdx])
  else loadCard(vocab[flashcardCurrentIdx])
})


flashcardNext.addEventListener("click", () => {
  flashcardPrev.disabled = false;
  flashcardCurrentIdx++;
  if (flashcardCurrentIdx === vocab.length - 1) flashcardNext.disabled = true;

  if (shuffled) loadCard(shuffledVocab[flashcardCurrentIdx])
  else loadCard(vocab[flashcardCurrentIdx])
})


flashcardMaximize.addEventListener("click", () => {

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