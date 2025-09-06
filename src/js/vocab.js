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

let flashcardMaximized = false;
const introBlock = document.querySelector(".intro-block");
const flashcardMaximizeImg = flashcardMaximize.querySelector("img")
flashcardMaximize.addEventListener("click", () => {
  flashcardMaximized = !flashcardMaximized
  
  flashcardMaximize.disabled = true;

  flashcardMaximize.classList.toggle("active");
  const scrollbarWidth = getScrollbarWidth();
  if (flashcardMaximized) {
    flashcardBlock.style.top = flashcardBlock.offsetTop + "px";
    flashcardBlock.style.left = flashcardBlock.offsetLeft + "px";
    flashcardBlock.style.right = (pageWrapper.offsetWidth - flashcardBlock.offsetLeft - flashcardBlock.offsetWidth) + "px";
    flashcardBlock.style.bottom = (pageWrapper.offsetHeight - flashcardBlock.offsetTop - flashcardBlock.offsetHeight) + "px";

    introBlock.style.marginBottom = (flashcardBlock.offsetHeight + 20) + "px";
    const computedStyle = window.getComputedStyle(pageWrapper).paddingRight;
    pageWrapper.style.transition = "none";
    pageWrapper.style.paddingRight = (scrollbarWidth + parseInt(computedStyle)) + "px";
    requestAnimationFrame(() => {
      flashcardBlock.classList.add("fullscreen");
      flashcardBlock.style.left = "0px";
      flashcardBlock.style.right = "0px";
      flashcardBlock.style.top = pageWrapper.scrollTop + "px";
      flashcardBlock.style.bottom = -pageWrapper.scrollTop + "px";
    })

    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = i !== flashcardBlock})
  } else {
    const temp = introBlock.style.marginBottom;

    flashcardBlock.style.transition = "none"
    flashcardBlock.classList.remove("fullscreen");
    introBlock.style.marginBottom = "";
    pageWrapper.style.paddingRight = "";
    flashcardBlock.getBoundingClientRect()

    const offsetTop = flashcardBlock.offsetTop;
    const offsetLeft = flashcardBlock.offsetLeft
    const offsetWidth = flashcardBlock.offsetWidth;
    const offsetHeight = flashcardBlock.offsetHeight;

    introBlock.style.marginBottom = temp;
    flashcardBlock.classList.add("fullscreen");
    flashcardBlock.getBoundingClientRect()
    flashcardBlock.style.transition = "";

    flashcardBlock.style.top = offsetTop + "px";
    flashcardBlock.style.left = offsetLeft + "px";
    flashcardBlock.style.right = (pageWrapper.offsetWidth - offsetLeft - offsetWidth - scrollbarWidth) + "px"
    flashcardBlock.style.bottom = (pageWrapper.offsetHeight - offsetTop - offsetHeight) + "px"
    flashcardBlock.style.position = "absolute"
    requestAnimationFrame(() => {
      flashcardBlock.classList.remove("fullscreen");
      pageWrapper.style.transition = "";
    })

    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = false})
  }
})

flashcardBlock.addEventListener("transitionend", (e) => {
  if (e.propertyName === "left") {
    flashcardMaximize.disabled = false;
    if (flashcardMaximized) {
      flashcardBlock.style.transition = "none"
    } else {
      flashcardBlock.style.position = "";
      introBlock.style.marginBottom = "";
      flashcardBlock.style.top = "";
      flashcardBlock.style.left = "";
      flashcardBlock.style.bottom = "";
      flashcardBlock.style.right = "";
    }
  }
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

function getScrollbarWidth() {
  // Create a temporary div element
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // Force scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // For IE/Edge
  document.body.appendChild(outer);

  // Create an inner div with a width of 100%
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculate the scrollbar width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Remove the temporary elements
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}