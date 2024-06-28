let data;
const subjectSel = document.getElementById("subjectSel");
const unitSel = document.getElementById("unitSel");
const typeSel = document.getElementById("groupSel");
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

let allGameTypes = [];

let subject = "";
let unit = "";
let type = "";
let game = "";
let remainingCards = [];
let currentCards = [];
let totalCards = [];

let timerInterval;
let currentTime = 0;
let completedCards = 0;
let gameActive = false;

subjectSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    subjectSel.value = subject;
    return;
  }

  unitSel.disabled = false;
  typeSel.disabled = false;

  Array.from(unitSel.getElementsByClassName("new")).forEach(i => i.remove());
  Array.from(typeSel.getElementsByClassName("new")).forEach(i => i.remove());

  subject = subjectSel.value;
  fetch("/tools/flashcards/" + subject + ".json")
  .then((res) => res.json())
  .then((json) => {
    data = json
    Object.keys(data.Units).forEach(unit => {
      unitSel.insertAdjacentHTML("beforeend", `<option class="new">${unit}</option>`);
    })
    data.Groups.forEach(group => {
      typeSel.insertAdjacentHTML("beforeend", `<option class="new">${group}</option>`)
    });

    allGameTypes = [...data.Matching, ...data.Categorization, ...data.Sentences];
  });
  unitSel.value = "";
  typeSel.value = "";
  unit = "";
  type = "";
  disableGame();
})

unitSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    unitSel.value = unit;
    return;
  }
  unit = unitSel.value;
  disableGame();
  enableGame();
})

typeSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    typeSel.value = type;
    return;
  }
  type = typeSel.value;
  disableGame();
  enableGame();
})

function enableGame() {
  if (unit !== "" && type !== "") {
    gameSel.disabled = false;
    let games = [];
  
    if (type === "all") {
      games = [...allGameTypes];
    } else {
      games = data[type]
    }
  
    games.forEach(value => {
      gameSel.insertAdjacentHTML("beforeend", `<option class="new">${value}</option>`)
    })
  }
}

function disableGame() {
  gameSel.disabled = true;
  Array.from(gameSel.getElementsByClassName("new")).forEach(i => i.remove())
  gameSel.selectedIndex = 0;
  gameContainer.hidden = true;
  resetGameInfo();
  gameActive = false;
}

function resetGameInfo() {
  gameInfo.classList.add("closed");
  clearInterval(timerInterval);
  gameScore.textContent = "0/0";
  gameTimer.textContent = "00:00";
}

gameSel.addEventListener("change", () => {
  if (gameActive && !confirm("Are you sure you want to do this? Doing so will abort your game.")) {
    gameSel.value = game;
    return;
  }
  game = gameSel.value;

  resetGameInfo();

  totalCards = [];
  remainingCards = [];
  let cardNames = [];
  let cardCandidates = [];

  if (unit === "all") {
    for (i in data.Units) {
      cardCandidates.push(...data.Units[i]);
    }
  } else cardCandidates = data.Units[unit];

  if (type !== "all") cardCandidates = cardCandidates.filter(card => card.Group.includes(type));

  cardCandidates = cardCandidates.filter(card => card.hasOwnProperty(game));

  for (idx in cardCandidates) {
    if (!cardNames.includes(cardCandidates[idx].Term)) {
      cardNames.push(cardCandidates[idx].Term);
      totalCards.push(cardCandidates[idx]);
    }
  }
  shuffleArray(totalCards);
  preStartGame();
})

function preStartGame() {
  gameContainer.hidden = false;
  gameOverlay.style.display = "flex";
  matchingBoard.style.display = "none";
  sentencesBoard.hidden = true;

  remainingCards = [...totalCards];
  if (data.Matching.includes(game)) {
    matchingBoard.style.display = "grid";

    currentCards = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    updateMatchingBoard();

    completedCards = 0;
    gameScore.textContent = completedCards + "/" + totalCards.length;

  } else if (data.Categorization.includes(game)) {
    console.log("Categorization")

  } else if (data.Sentences.includes(game)) {
    sentencesBoard.hidden = false;
    currentCards = 0;
    Array.from(sentencesBoard.getElementsByClassName("sentence")).forEach(i => i.remove())
    totalCards.forEach(card => {
      let sentence = ""
      card.Sentence.forEach(part => {
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

    completedCards = 0;
    gameScore.textContent = completedCards + "/" + totalCards.length;
  } else {
    console.log("error")
  }
}

function checkSentence() {
  const inputs = sentences[currentCards].getElementsByTagName("input");
  const answers = remainingCards[currentCards].Sentence.filter(i => typeof i !== "string");
  let success = true;
  answers.forEach((answer, idx) => {
    answer = answer.map(i => i.toLowerCase())
    if (!answer.includes(inputs[idx].value.toLowerCase())) {
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

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function fillMatchingBoard() {
  const emptyCards = currentCards.filter(card => card === undefined).length/2;
  const newCards = remainingCards.splice(0, emptyCards);
  
  let tempCards = Array(emptyCards*2).fill(undefined);
  for (let i = 0; i < emptyCards && i < newCards.length; i++) {
    tempCards[i*2] = newCards[i].Term;
    tempCards[i*2+1] = newCards[i][game]
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
    matchingTiles[i].textContent = currentCards[i];
    matchingTiles[i].classList.remove("empty");
  }
}
}

matchingTiles.forEach(tile => {tile.addEventListener("click", event => {
  event.target.classList.toggle("selected");
  const selected = document.querySelectorAll("#matchingBoard button.selected");

  if (selected.length === 2) {
    const tile1 = selected[0].textContent;
    const tile2 = selected[1].textContent;

    const termCard1 = totalCards.find(card => card.Term === tile1);
    const termCard2 = totalCards.find(card => card.Term === tile2);

    if ((termCard1 && termCard1[game] === tile2) || (termCard2 && termCard2[game] === tile1)) {
      currentCards[Array.from(matchingTiles).indexOf(selected[0])] = undefined;
      currentCards[Array.from(matchingTiles).indexOf(selected[1])] = undefined;
      updateMatchingBoard();

      completedCards++
      gameScore.textContent = completedCards + "/" + totalCards.length;
    }

    selected.forEach(tile => {tile.classList.remove("selected")});
  }
})})

function updateTimer() {
  currentTime++;
  let seconds = currentTime % 60;
  let minutes = Math.floor(currentTime/60);

  if (seconds < 10) seconds = "0" + seconds;
  if (minutes < 10) minutes = "0" + minutes;

  gameTimer.textContent = minutes + ":" + seconds;
}

playBtn.addEventListener("click", () => {
  gameInfo.classList.remove("closed");
  currentTime = -1;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  gameOverlay.style.display = "none";
  gameActive = true;
})

function win() {
  gameActive = false;
  clearInterval(timerInterval);
  const seconds = currentTime % 60;
  const minutes = Math.floor(currentTime/60);
  alert("You beat the game in " + minutes + " minutes and " + seconds + " seconds!");
}