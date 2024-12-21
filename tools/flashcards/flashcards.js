// HTML element variables
let data;
const subjectSel = query("#subjectSel");
const unitSel = query("#unitSel");
const unitForm = query("#unitSel form");
const typeSel = query("#groupSel");
const typeForm = query("#groupSel form");
const gameSel = query("#gameType");
const matchingBoard = query("#matchingBoard");
const matchingTiles = queryAll("#matchingBoard button")
const gameInfo = query("#gameInfo")
const gameScore = query("#gameScore")
const gameTimer = query("#gameTimer")
const gameContainer = query("#gameContainer")
const gameOverlay = query("#gameOverlay")
const gameOutput = query("#gameOutput")
const playBtn = query("#playBtn")
const replayBtn = query("#replayBtn");
const sentencesBoard = query("#sentencesBoard")
const prevSentence = query("#prevSentence")
const nextSentence = query("#nextSentence")
let sentences;
const categoryBoard = query("#categoryBoard")
const categoryCard = query("#categoryCard")
const categoryOptions = query("#categoryOptions");
const maxCardsSel = query("#maxCards")
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
  typeSel.querySelector("span").textContent = "Select a group of terms";
  unitSel.querySelector("span").textContent = "Select a unit";

  subject = subjectSel.value;
  fetch("/tools/flashcards/" + subject + ".json")
  .then((res) => res.json())
  .then((json) => {
    data = json;

    handleSel(unitSel, unitForm, Object.keys(data.Units), "unit");

    handleSel(typeSel, typeForm, data.Groups, "group");

    allGameTypes = [...data.Matching, ...data.Images,...data.Categorization, ...data.Sentences];
  });
  unitForm.reset();
  typeForm.reset();
  unit = [];
  type = [];
  disableGame();
})

function handleSel(sel, form, options, id) {
  sel.style.width = "max-content";
  form.style.width = "max-content";
  options.forEach((option,idx) => {
    form.insertAdjacentHTML("beforeend", `<input class="new" onclick="check${capitalize(id)}(event)" type="checkbox" id="${id}${idx+1}">`)
    form.insertAdjacentHTML("beforeend", ` <label class="new" for="${id}${idx+1}">${option}</option><br>`);
  });
  let temp1 = Math.max(sel.getBoundingClientRect().width, form.getBoundingClientRect().width) + "px";
  sel.style.width = temp1;
  form.style.width = temp1;
}

function checkUnit(event) {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    event.preventDefault()
    return;
  }
  if (event.target.id === "unitall" && event.target.checked === true) {
    unitForm.reset()
    event.target.checked = true;
  } else {
    query("#unitall").checked = false;
  }
  
  unit = getSelected(unitForm);

  if (unit.length === 0) {
    unitSel.querySelector("span").textContent = "Select a group of terms";
  } else if (unit.length === 1) {
    unitSel.querySelector("span").textContent = unit[0].split(": ")[0];
  } else {
    let temp1 = unit.map(i => i.split(": ")[0].split(" ")[1])
    unitSel.querySelector("span").textContent = "Units " + temp1.join(", ");
  }

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
    query("#groupall").checked = false;
  }
  
  type = getSelected(typeForm);

  if (type.length === 0) {
    groupSel.querySelector("span").textContent = "Select a group of terms";
  } else {
    groupSel.querySelector("span").textContent = type.join(", ")
  }
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
  game="";
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

  if (totalCards.length === 0) {
    alert("There are no terms matching your selected criteria. Please reselect and try again");
    return;
  }

  // Reset game state
  matchingTiles.forEach(i => {i.classList.remove("selected")})
  gameContainer.hidden = false;
  gameOverlay.style.display = "flex";
  playBtn.hidden = false;
  gameOutput.hidden = true;
  matchingBoard.style.display = "none";
  sentencesBoard.hidden = true;
  categoryBoard.style.display = "none";

  if (data.Matching.includes(game)) {
    // Setup Matching game
    matchingBoard.style.display = "grid";
    totalCards.forEach(i => i[1] = chooseOne(i[1]));

    currentCards = Array(20).fill(undefined);
    updateMatchingBoard();
  } else if (data.Categorization.includes(game)) {
    // Setup Categorization game
    categoryBoard.style.display = "grid";
    currentCards = remainingCards.shift();
    Array.from(queryAll("#categoryOptions button")).forEach(i => i.remove())
    data[game].forEach(option => {
      categoryOptions.insertAdjacentHTML("beforeend", `<button>${option}</button>`)
    })
    options = Array.from(queryAll("#categoryOptions button"));
    options.forEach(option => {option.addEventListener("click", selectCategoryOption)})
    updateCategory();

  } else if (data.Sentences.includes(game)) {
   // Setup Sentences game
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
    // Setup Images game
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

replayBtn.addEventListener("click", () => {
  prepareGame();
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
  let time;
  if (minutes === 1) {
    time = "1 minute and "
  } else if (minutes > 0) {
    time = minutes + " minutes and ";
  }
  
  if (seconds === 1) time += "1 second";
  else time += seconds + " seconds";

  if (matchAttempts > 0) {
    gameOutput.querySelector("p").innerHTML = "You beat the game in " + time + " at " + accuracy + "% accuracy!";
  } else {
    gameOutput.querySelector("p").innerHTML = "You beat the game in " + time + "!";
  }

  gameOutput.hidden = false;
  playBtn.hidden = true;
  gameOverlay.style.display = "flex";
}


// Sentences functions
function checkSentence() {
  const responses = Array.from(sentences[currentCards].querySelectorAll("input")).map(i => i.value.trim().toLowerCase());

  const answers = remainingCards[currentCards][1].filter(i => Array.isArray(i)).map(i => i.map(j => j.trim().toLowerCase()));

  const success = answers.every((answer, idx) => answer.includes(responses[idx]));

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
function updateMatchingBoard() {
  const emptyCount = currentCards.filter(card => card === undefined).length/2;

  if (emptyCount >= currentCards.length/4) {
    const newCards = remainingCards.splice(0, emptyCount);
  
    const emptyIndexes = [];
    currentCards.forEach((i, idx) => {
      if (i === undefined) {
        emptyIndexes.push(idx);
      }
    })
  
    shuffleArray(emptyIndexes);
  
    newCards.forEach(card => {
      const [idx1, idx2] = [emptyIndexes.shift(), emptyIndexes.shift()];

      matchingTiles[idx1].innerHTML = card[0];
      matchingTiles[idx1].classList.add("term");
      currentCards[idx1] = card[0];

      matchingTiles[idx2].innerHTML = card[1];
      matchingTiles[idx2].classList.remove("term");
      currentCards[idx2] = card[1];
    })
  }

  if (currentCards.every(card => card === undefined)) win();
  
  currentCards.forEach((card, i) => {
    matchingTiles[i].classList.toggle("empty", card === undefined);
  });
}

matchingTiles.forEach(tile => {tile.addEventListener("click", event => {
  event.target.classList.toggle("selected");
  const selected = queryAll("#matchingBoard button.selected");

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
  Array.from(categoryOptions.querySelectorAll("button")).forEach(option => {option.classList.remove("correct", "incorrect")})
}

function selectCategoryOption(event) {
  const btn = event.target;

  if (btn.classList.contains("correct") || btn.contains("incorrect")) return;

  matchAttempts++;



  if (typeof currentCards[1] === "string") {
    if (currentCards[1] === btn.textContent) {
      btn.classList.add("correct");

      currentCards = remainingCards.shift();
      updateCategory()

      completedCards++
      gameScore.textContent = completedCards + "/" + totalCards.length;
    } else {
      btn.classList.add("incorrect");
    }
  } else {
    if (currentCards[1].includes(btn.textContent)) {
      currentCards[1] = currentCards[1].filter(i => i !== btn.textContent);
      btn.classList.add("correct");
      if (currentCards[1].length === 0) {
        currentCards = remainingCards.shift();
        updateCategory()
  
        completedCards++
        gameScore.textContent = completedCards + "/" + totalCards.length;
      }
    } else {
      btn.classList.add("incorrect");
    }
  }

      
  if (remainingCards.length === 0) {
    win();
  }
}


// Utility functions
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
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

function query(selector) {
  return document.querySelector(selector);
}

function queryAll(selector) {
  return document.querySelectorAll(selector);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}