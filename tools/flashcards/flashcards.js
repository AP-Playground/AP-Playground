// HTML element variables
let data;
const subjectSel = document.getElementById("subjectSel");
const unitSel = document.getElementById("unitSel");
const unitForm = document.querySelector("#unitSel form");
const typeSel = document.getElementById("groupSel");
const typeForm = document.querySelector("#groupSel form");
const gameSel = document.getElementById("gameType");
const matchingBoard = document.getElementById("matchingBoard");
const matchingTiles = document.querySelectorAll("#matchingBoard button")
const gameInfo = document.getElementById("gameInfo")
const gameScore = document.getElementById("gameScore")
const gameTimer = document.getElementById("gameTimer")
const gameContainer = document.getElementById("gameContainer")
const gameOverlay = document.getElementById("gameOverlay")
const playBtn = document.getElementById("playBtn")
const sentencesBoard = document.getElementById("sentencesBoard")
const prevSentence = document.getElementById("prevSentence")
const nextSentence = document.getElementById("nextSentence")
let sentences;
const categoryBoard = document.getElementById("categoryBoard")
const categoryCard = document.getElementById("categoryCard")
const categoryOptions = document.getElementById("categoryOptions");
const maxCardsSel = document.getElementById("maxCards")
let options;


// Game variables
let allGameTypes = [];

let subject = "";
let unit = [];
let type = [];
let game = "";
let maxCards = 0;
let remainingCards = [];
let currentCards = [];
let totalCards = [];

let timerInterval;
let currentTime = 0;
let completedCards = 0;
let gameActive = false;
let matchAttempts = 0;


// Game select functions
subjectSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    subjectSel.value = subject;
    return;
  }

  unitSel.disabled = false;
  typeSel.disabled = false;

  Array.from(unitForm.getElementsByClassName("new")).forEach(i => i.remove());
  Array.from(typeForm.getElementsByClassName("new")).forEach(i => i.remove());

  subject = subjectSel.value;
  fetch("/tools/flashcards/" + subject + ".json")
  .then((res) => res.json())
  .then((json) => {
    data = json;
    Object.keys(data.Units).forEach((unit,idx) => {
      unitForm.insertAdjacentHTML("beforeend", `<input class="new" onclick="checkUnit(event)" type="checkbox" id="unit${idx+1}">`)
      unitForm.insertAdjacentHTML("beforeend", ` <label class="new" for="unit${idx+1}">${unit}</option><br>`);
    });
    data.Groups.forEach((group,idx) => {
      typeForm.insertAdjacentHTML("beforeend", `<input class="new" onclick="checkGroup(event)" type="checkbox" id="group${idx+1}">`)
      typeForm.insertAdjacentHTML("beforeend", ` <label class="new" for="group${idx+1}">${group}</option><br>`);
    });

    allGameTypes = [...data.Matching, ...data.Images,...data.Categorization, ...data.Sentences];
  });
  unitForm.reset();
  typeForm.reset();
  unit = [];
  type = [];
  disableGame();
})

function checkUnit(event) {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    event.preventDefault()
    return;
  }
  if (event.target.id === "unitall" && event.target.checked === true) {
    unitForm.reset()
    event.target.checked = true;
  } else {
    document.querySelector("#unitall").checked = false;
  }
  
  unit = getSelected(unitForm);
  disableGame();
  enableGame();
}

function checkGroup(event) {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    event.preventDefault()
    return;
  }
  if (event.target.id === "groupall" && event.target.checked === true) {
    typeForm.reset()
    event.target.checked = true;
  } else {
    document.querySelector("#groupall").checked = false;
  }
  
  type = getSelected(typeForm);
  disableGame();
  enableGame();
}

function getSelected(form) {
  const output = [];
  const checkboxes = form.querySelectorAll("input");
  const label = form.querySelectorAll("label");
  checkboxes.forEach((i,idx) => {
    if (i.checked) output.push(label[idx].textContent)
  })
  return output;
}

function enableGame() {
  if (unit.length > 0 && type.length > 0) {
    gameSel.disabled = false;
    maxCardsSel.disabled = false;
    let games = [];
  
    if (type[0] === "All Terms") {
      games = [...allGameTypes];
    } else {
      type.forEach(i => {
        games.push(...data[i])
      })
      games = [...new Set(games)]
    }
  
    games.forEach(value => {
      gameSel.insertAdjacentHTML("beforeend", `<option class="new">${value}</option>`)
    })
  }
}

function disableGame() {
  gameSel.disabled = true;
  maxCardsSel.disabled = true;
  Array.from(gameSel.getElementsByClassName("new")).forEach(i => i.remove())
  gameSel.selectedIndex = 0;
  gameContainer.hidden = true;
  resetGameInfo();
  gameActive = false;
}

gameSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    gameSel.value = game;
    return;
  }
  game = gameSel.value;
  gameActive = false;

  resetGameInfo();

  if (game !== "" && maxCards !== 0) {
    prepareGame();
  }
})

maxCardsSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    maxCardsSel.value = maxCards;
    return;
  }
  maxCards = maxCardsSel.value;
  gameActive = false;

  resetGameInfo();

  if (game !== "" && maxCards !== 0) {
    prepareGame();
  }
})

function filterCards() {
  let cardNames = [];
  let cardCandidates = [];
  let cards = []

  if (unit[0] === "All Units") {
    for (i in data.Units) {
      cardCandidates.push(...data.Units[i]);
    }
  } else {
    unit.forEach(i => {
      cardCandidates.push(...data.Units[i])
    })
  }

  if (type[0] !== "All Terms") {
    cardCandidates = cardCandidates.filter(card => card.Group.some(item => type.includes(item)))
  };

  cardCandidates = cardCandidates.filter(card => card.hasOwnProperty(game));

  for (idx in cardCandidates) {
    if (!cardNames.includes(cardCandidates[idx].Term)) {
      cardNames.push(cardCandidates[idx].Term);
      cards.push(cardCandidates[idx]);
    }
  }

  cards = cards.map(i => [chooseOne(i.Term), i[game]])

  shuffleArray(cards)
  return cards.slice(0, maxCards);
}


// General game functions
function prepareGame() {
  totalCards = filterCards();
  remainingCards = [...totalCards];

  gameContainer.hidden = false;
  gameOverlay.style.display = "flex";
  matchingBoard.style.display = "none";
  sentencesBoard.hidden = true;
  categoryBoard.hidden = true;

  if (data.Matching.includes(game)) {
    matchingBoard.style.display = "grid";
    totalCards.forEach(i => i[1] = chooseOne(i[1]));

    currentCards = Array(20).fill(undefined);
    updateMatchingBoard();
  } else if (data.Categorization.includes(game)) {
    categoryBoard.hidden = false;
    currentCards = remainingCards.shift();
    Array.from(document.querySelectorAll("#categoryOptions button")).forEach(i => i.remove())
    data[game].forEach(option => {
      categoryOptions.insertAdjacentHTML("beforeend", `<button>${option}</button>`)
    })
    options = Array.from(document.querySelectorAll("#categoryOptions button"));
    options.forEach(option => {option.addEventListener("click", selectCategoryOption)})
    updateCategory();

  } else if (data.Sentences.includes(game)) {
    sentencesBoard.hidden = false;
    currentCards = 0;
    Array.from(sentencesBoard.getElementsByClassName("sentence")).forEach(i => i.remove())
    totalCards.forEach(card => {
      let sentence = ""
      card[1].forEach(part => {
        if (typeof part === "string") {
          sentence += `<span>${part}</span>`
        } else {
          sentence += `<input type="text" oninput="checkSentence();">`
        }
      })
      sentence = `<div class="sentence" hidden>` + sentence + "</div>";
      sentencesBoard.insertAdjacentHTML("beforeend", sentence);
    })
    sentences = Array.from(document.getElementsByClassName("sentence"));
    updateSentences();
  } else if (data.Images.includes(game)) {
    matchingBoard.style.display = "grid";
    totalCards.forEach(i => i[1] = chooseOne(i[1]));

    totalCards.forEach(i => i[1] = `<img src="${i[1]}">`)

    currentCards = Array(20).fill(undefined);
    updateMatchingBoard();
  }

  completedCards = 0;
  gameScore.textContent = completedCards + "/" + totalCards.length;
}

function updateTimer() {
  currentTime++;
  let seconds = currentTime % 60;
  let minutes = Math.floor(currentTime/60);

  if (seconds < 10) seconds = "0" + seconds;
  if (minutes < 10) minutes = "0" + minutes;

  gameTimer.textContent = minutes + ":" + seconds;
}

function resetGameInfo() {
  gameInfo.classList.add("closed");
  clearInterval(timerInterval);
  gameScore.textContent = "0/0";
  gameTimer.textContent = "00:00";
}

playBtn.addEventListener("click", () => {
  gameInfo.classList.remove("closed");
  currentTime = -1;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  gameOverlay.style.display = "none";
  gameActive = true;
  matchAttempts = 0;
})

function win() {
  gameActive = false;
  clearInterval(timerInterval);
  const seconds = currentTime % 60;
  const minutes = Math.floor(currentTime/60);
  const accuracy = Math.round(totalCards.length/matchAttempts*100);

  if (matchAttempts > 0) {
    alert("You beat the game in " + minutes + " minutes and " + seconds + " seconds at " + accuracy + "% accuracy!");
  } else {
    alert("You beat the game in " + minutes + " minutes and " + seconds + " seconds!");
  }

}


// Sentences functions
function checkSentence() {
  const nodeSegments = sentences[currentCards].children;
  const promptSegments = remainingCards[currentCards][1];
  let success = true;

  promptSegments.forEach((answer, idx) => {
    if (typeof answer === "string") return;
    answer = answer.map(i => i.toLowerCase())
    if (!answer.includes(nodeSegments[idx].value.toLowerCase().trim())) {
      success = false;
    }
  })
  if (success) {
    sentences[currentCards].remove()
    sentences.splice(currentCards, 1);
    remainingCards.splice(currentCards, 1);
    if (currentCards === remainingCards.length) {
      currentCards--;
    }
    completedCards++
    gameScore.textContent = completedCards + "/" + totalCards.length;
    if (remainingCards.length === 0) {
      win()
    } else updateSentences();
  }
}

function updateSentences() {
  sentences.forEach(i => i.hidden = true);
  sentences[currentCards].hidden = false;
  prevSentence.disabled = currentCards === 0;
  nextSentence.disabled = currentCards === remainingCards.length;
  sentences[currentCards].querySelector("input").focus()
}

prevSentence.addEventListener("click", () => {
  if (currentCards > 0) {
    currentCards--;
    updateSentences();
  }
})

nextSentence.addEventListener("click", () => {
  if (currentCards <= remainingCards.length-2) {
    currentCards++;
    updateSentences();
  }
})


// Matching functions
function fillMatchingBoard() {
  const emptyCards = currentCards.filter(card => card === undefined).length/2;
  const newCards = remainingCards.splice(0, emptyCards);
  
  let tempCards = Array(emptyCards*2).fill(undefined);
  for (let i = 0; i < emptyCards && i < newCards.length; i++) {
    tempCards[i*2] = newCards[i][0];
    tempCards[i*2+1] = newCards[i][1]
  }

  shuffleArray(tempCards)

  j = 0;
  for (let i = 0; i < 20; i++) {
    if (currentCards[i] === undefined) {
      currentCards[i] = tempCards[j];
      j++;
    }
  }
}

function updateMatchingBoard() {
  if (currentCards.filter(card => card === undefined).length >= currentCards.length/2) {
    fillMatchingBoard();
  }

  if (currentCards.filter(card => card === undefined).length === currentCards.length) {
    win();
  }
  
  for (let i = 0; i < 20; i++) {
    if (currentCards[i] === undefined) {
      matchingTiles[i].classList.add("empty");
    } else {
      matchingTiles[i].innerHTML = currentCards[i];
      matchingTiles[i].classList.remove("empty");
    }
  }
}

matchingTiles.forEach(tile => {tile.addEventListener("click", event => {
  event.target.classList.toggle("selected");
  const selected = document.querySelectorAll("#matchingBoard button.selected");

  if (selected.length === 2) {
    matchAttempts++;

    const tile1 = decodeHtml(selected[0]);
    const tile2 = decodeHtml(selected[1]);

    if (totalCards.find(card => card.includes(tile1) && card.includes(tile2))) {
      currentCards[Array.from(matchingTiles).indexOf(selected[0])] = undefined;
      currentCards[Array.from(matchingTiles).indexOf(selected[1])] = undefined;
      updateMatchingBoard();

      completedCards++
      gameScore.textContent = completedCards + "/" + totalCards.length;
    }

    selected.forEach(tile => {tile.classList.remove("selected")});
  }
})})


// Categorization functions
function updateCategory() {
  categoryCard.textContent = currentCards[0];
}

function selectCategoryOption(event) {
  matchAttempts++;
  if (
    (typeof currentCards[1] === "string" && currentCards[1] === event.target.textContent)
    || (typeof currentCards[1] === "object" && currentCards[1].includes(event.target.textContent))
  ) {
    if (remainingCards.length === 0) {
      win();
      return;
    }
    currentCards = remainingCards.shift();
    updateCategory()

    completedCards++
    gameScore.textContent = completedCards + "/" + totalCards.length;
  }
}


// Utility functions
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

const txt = document.createElement("textarea");
function decodeHtml(element) {
  txt.innerHTML = element.innerHTML;
  return txt.value;
}

function chooseOne(i) {
  if (typeof i === "string") {
    return i;
  }
  return i[Math.floor(Math.random() * i.length)];
}