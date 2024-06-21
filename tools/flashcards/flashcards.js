let data;
const subjectSel = document.getElementById("subjectSel");
const unitSel = document.getElementById("unitSel");
const typeSel = document.getElementById("groupSel");
const gameSel = document.getElementById("gameType");
const matchingBoard = document.getElementById("matchingBoard");
const matchingTiles = document.querySelectorAll("#matchingBoard tr td")

const gameContainer = document.getElementById("game");

let allGameTypes = [];

let unit = "";
let type = "";
let game = "";
let remainingCards = [];
let currentCards = [];
let totalCards = [];

subjectSel.addEventListener("change", () => {
  if (subjectSel.selectedIndex !== 0) {
    unitSel.disabled = false;
    typeSel.disabled = false;

    Array.from(unitSel.getElementsByClassName("new")).forEach(element => {element.remove()})
    Array.from(typeSel.getElementsByClassName("new")).forEach(element => {element.remove()})

    const subject = subjectSel.value;
    fetch("/tools/flashcards/" + subject + ".json").then((res) => {
      return res.json();
    }).then((json) => {
      data = json;
      Object.keys(data.Units).forEach(unit => {
        unitSel.insertAdjacentHTML("beforeend", `<option class="new">${unit}</option>`);
      })
      data.Groups.forEach(group => {
        typeSel.insertAdjacentHTML("beforeend", `<option class="new">${group}</option>`)
      });

      allGameTypes = [...data.Matching, ...data.Categorization, ...data.Sentences];
    })
    unitSel.value = "";
    typeSel.value = "";
    unit = "";
    type = "";
  }
  unloadGame();
})

unitSel.addEventListener("change", () => {
  if (unitSel.selectedIndex !== 0) {
    openGame();
  } else {
    unloadGame();
  }
})

typeSel.addEventListener("change", () => {
  if (typeSel.selectedIndex !== 0) {
    openGame();
  } else {
    unloadGame();
  }
})

function openGame() {
  unloadGame()
  unit = unitSel.value;
  type = typeSel.value;

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

function unloadGame() {
  gameSel.disabled = true;
  Array.from(gameSel.getElementsByClassName("new")).forEach(element => {element.remove()})
  gameSel.selectedIndex = 0;
  matchingBoard.hidden = true;
}

gameSel.addEventListener("change", () => {
  game = gameSel.value;
  matchingBoard.hidden = true;
  if (gameSel.value !== "") {
    remainingCards = [];
    let cardNames = [];
    let cardCandidates = [];
    totalCards = [];

    if (unit === "all") {
      for (item in data.Units) {
        cardCandidates.push(...data.Units[item]);
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
    startGame();
  }
})

function startGame() {
  remainingCards = totalCards;
  if (data.Matching.includes(game)) {
    console.log("Matching")
    matchingBoard.hidden = false;

    currentCards = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    fillMatchingBoard();

  } else if (data.Categorization.includes(game)) {
    console.log("Categorization")

  } else if (data.Sentences.includes(game)) {
    console.log("Sentences")

  } else {
    console.log("error")
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function fillMatchingBoard() {
  let emptyCards = currentCards.filter(card => card === undefined).length/2;
  let newCards = remainingCards.splice(0, emptyCards);
  
  let tempCards = Array(emptyCards*2).fill(undefined);
  for (let i = 0; i < emptyCards && i < newCards.length; i++) {
    tempCards[i*2] = newCards[i].Term;
    tempCards[i*2+1] = newCards[i][game]
  }

  shuffleArray(tempCards)

  j = 0;
  for (let i = 0; i < emptyCards*2; i++) {
    if (currentCards[i] === undefined) {
      currentCards[i] = tempCards[j];
      j++;
    }
  }

  updateMatchingBoard();
}

function updateMatchingBoard() {
  for (let i = 0; i < 20; i++) {
    if (currentCards[i] === undefined) {
      matchingTiles[i].textContent = "";
      matchingTiles[i].classList.add("empty");
    } else {
      matchingTiles[i].textContent = currentCards[i];
      matchingTiles[i].classList.remove("empty");
    }
  }
}