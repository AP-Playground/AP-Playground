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
  if (games.includes("location")) {
    gameLocation.style.display = "block";
  } else {
    gameLocation.style.display = "none";
  }
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
  if (games.includes("location")) {
    locationSelection.style.display = "none";
    locationFeedback.innerText = "(Click on the map to select a location)";
    locationCorrect.style.display = "none";
    locationCorrect.style.top = ((90-card["location-coordinate"][1])/180*100) + "%";
    locationCorrect.style.left = ((card["location-coordinate"][0]+180)/360*100) + "%";
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
  
  if (games.includes("location")) {
    if (locationSelection.style.display === "none") {
      locationFeedback.innerText = cards[0].location;
    } else {
      locationCorrect.style.display = "flex";
      let locSelectionX = Number.parseFloat(locationSelection.style.left)*3.6-180;
      let locSelectionY = 90-Number.parseFloat(locationSelection.style.top)*1.8;
      let locCorrectX = cards[0]["location-coordinate"][0];
      let locCorrectY = cards[0]["location-coordinate"][1];
      locSelectionX *= Math.PI/180;
      locSelectionY *= Math.PI/180;
      locCorrectX *= Math.PI/180;
      locCorrectY *= Math.PI/180;
      let radius = 3963.1;
      let calc = 1-Math.cos(locCorrectY)*Math.cos(locSelectionY)*Math.cos(locCorrectX-locSelectionX)-Math.sin(locCorrectY)*Math.sin(locSelectionY);
      let distance = 2*Math.asin(Math.sqrt(calc)/2)*radius;

      locationFeedback.innerText = Math.round(distance) + " miles away; " + cards[0].location;
      if (distance < 150) {
        score += 1
      } else if (distance < 500) {
        score += 1-(distance-150)/350;
      }
    }
  }
}


const locationSelection = document.getElementById("game-location-selection");
const locationCorrect = document.getElementById("game-location-correct");
const locationMap = document.getElementById("game-location-map");
const locationFeedback = document.getElementById("game-location-feedback");
locationMap.addEventListener("click", (event) => {
  const rect = locationMap.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const width = locationMap.width;
  const height = locationMap.height;
  const xPercent = (x / width) * 100;
  const yPercent = (y / height) * 100;
  locationSelection.style.top = `${yPercent}%`;
  locationSelection.style.left = `${xPercent}%`;
  locationSelection.style.display = "flex";
})


const submitButton = document.getElementById("submit");
const continueButton = document.getElementById("continue");
submitButton.addEventListener("click", () => {
  checkAnswer();
  submitButton.hidden = true;
  continueButton.hidden = false;
});

continueButton.addEventListener("click", () => {
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