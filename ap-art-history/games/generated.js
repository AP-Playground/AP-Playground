const urlParams = new URLSearchParams(window.location.search);
const units = urlParams.getAll('unit');
const games = urlParams.getAll('game');
const identifier = urlParams.get('identifier');

const loading = document.getElementById("loading");
const gameContainer = document.getElementById("game-container");
const identifierImage = document.getElementById("game-identifier-image");
const identifierTitle = document.getElementById("game-identifier-title");

const gameLocation = document.getElementById("game-location");
const gameDate = document.getElementById("game-date");
const gameArtist = document.getElementById("game-artist");
const gameStyle = document.getElementById("game-style");

let cards = [];

let data;
fetch("/ap-art-history/games/data.json").then(response => response.json()).then(json => {
  data = json;
  loadGame();
})

let score = 0;

function loadGame() {
  units.forEach(unit => {
    cards = cards.concat(data[unit-1]);
  })
  if (games.length === 1 && games[0] === "artist") {
    cards = cards.filter(card => card.artist);
  }
  if (cards.length === 0) {
    alert("No cards found for the selected units and games. Please try again with different parameters.");
    return;
  }
  shuffle(cards);

  switch (identifier) {
    case "image": {
      identifierTitle.hidden = true;
      break;
    }
    case "title": {
      identifierImage.hidden = true;
      break;
    }
    case "both": {
      break;
    }
  }

  if (games.includes("date")) {
    gameDate.style.display = "block";
  } else {
    gameDate.style.display = "none";
  }
  if (games.includes("artist")) {}
  if (games.includes("location")) {}
  if (games.includes("style")) {}

  loading.style.display = "none";
  gameContainer.style.display = "grid";
  loadCard(cards[0]);
}


function loadCard(card) {
  if (identifier !== "title") {
    identifierImage.src = chooseOne(card.image);
  }
  if (identifier !== "image") {
    identifierTitle.innerText = card.title;
  }
}


const dateToggle = document.getElementById("game-date-toggle");
const dateInput = document.getElementById("game-date-input");
const dateFeedback = document.getElementById("game-date-feedback");
let dateStatus = "CE";

dateToggle.addEventListener("click", () => {
  dateStatus = dateStatus === "CE" ? "BCE" : "CE";
  dateToggle.innerText = dateStatus;
});

function checkAnswer() {
  if (games.includes("date")) {
    let date = Number(dateInput.value);
    if (dateStatus === "BCE") {
      date = -date;
    }

    let dateBounds = cards[0]["date-range"];
    let dateNum = cards[0].dateNum;
    if (typeof dateNum === "number" && date === dateNum) {
      dateInput.classList.add("correct");
      score += 1;
    } else if (typeof dateNum !== "number" && date >= dateNum[0] && date <= dateNum[1]) {
      dateInput.classList.add("correct");
      score += 1;
      dateFeedback.innerText = cards[0].date;
    } else if (date >= dateBounds[0] && date <= dateBounds[1]){
      dateInput.classList.add("almost-correct");
      score += 1-2*Math.abs(dateNum-date)/(dateBounds[1]-dateBounds[0]);
      dateFeedback.innerText = cards[0].date;
    } else {
      dateInput.classList.add("incorrect");
      dateFeedback.innerText = cards[0].date;
    }

    dateInput.disabled = true;
    dateToggle.disabled = true;
  }
  
}


const submitButton = document.getElementById("submit");
const continueButton = document.getElementById("continue");
submitButton.addEventListener("click", () => {
  checkAnswer();
  submitButton.hidden = true;
  continueButton.hidden = false;
});

continueButton.addEventListener("click", () => {
  if (games.includes("date")) {
    dateInput.classList.remove("correct", "almost-correct", "incorrect");
    dateInput.value = "";
    dateInput.disabled = false;
    dateToggle.disabled = false;
    dateToggle.innerText = "CE";
    dateStatus = "CE";
    dateInput.style.textDecoration = "none";
    dateFeedback.innerText = "";
  }
  submitButton.hidden = false;
  continueButton.hidden = true;
  cards.shift();
  if (cards.length === 0) {
    alert("Game Over! Your score is: " + score);
  } else {
    loadCard(cards[0]);
  }
})



function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function chooseOne(i) {
  if (typeof i === "string") {
    return i;
  }
  return i[Math.floor(Math.random() * i.length)];
}