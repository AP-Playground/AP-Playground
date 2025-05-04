const urlParams = new URLSearchParams(window.location.search);
const units = urlParams.getAll('unit');
const games = urlParams.getAll('game');
const identifier = urlParams.get('identifier');
const sort = urlParams.get("sort");

const loading = document.getElementById("loading");
const gameContainer = document.getElementById("game-container");
const identifierImage = document.getElementById("game-identifier-image");
const identifierTitle = document.getElementById("game-identifier-title");

const gameLocation = document.getElementById("game-location");
const gameDate = document.getElementById("game-date");
const gameArtist = document.getElementById("game-artist");
const gameStyle = document.getElementById("game-style");
const gameTitle = document.getElementById("game-title");

let cards = [];
let history = [];
let reviewIdx = 0;

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
  if (identifier !== "image" && games.includes("title")) {
    alert("The only allowed identifier for the \"title\" gamemode is \"image\"");
    return;
  }

  switch (sort) {
    case "random": {
      shuffle(cards);
      break;
    }
    case "ced": {
      break;
    }
    case "date": {
      cards.sort((a,b) => chooseFirst(a["date-num"]) - chooseFirst(b["date-num"]));
      break;
    }
  }

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
  if (identifier !== "title") {
    preloadSrc = chooseOne(cards[0].image);
  }

  gameDate.style.display = games.includes("date") ? "grid" : "none";
  gameLocation.style.display = games.includes("location") ? "block" : "none";
  gameStyle.style.display = games.includes("style") ? "grid" : "none";
  gameTitle.style.display = games.includes("title") ? "grid" : "none";
  gameArtist.style.display = "none";
  
  loading.style.display = "none";
  gameContainer.style.display = "grid";
  loadCard(cards[0]);
}

let preloadSrc;
function loadCard(card) {

  if (identifier !== "title") {
    identifierImage.src = preloadSrc;
    
    if (cards.length > 1) {
      const preload = new Image();
      preloadSrc = chooseOne(cards[1].image);
      preload.src = preloadSrc;
    }
  }
  if (identifier !== "image") {
    identifierTitle.innerText = chooseFirst(card.title);
  }


  if (games.includes("date")) {
    dateInput.classList.remove("correct", "almost-correct", "incorrect");
    dateInput.value = "";
    dateInput.disabled = false;
    dateToggle.disabled = false;
    dateToggle.innerText = "CE";
    dateStatus = "CE";
    dateFeedback.innerText = "";
  }
  if (games.includes("location")) {
    locationSelection.style.display = "none";
    locationFeedback.innerText = "(Click on the map to select a location)";
    locationCorrect.style.display = "none";
    locationCorrect.style.top = ((90-card["location-coordinate"][0])/180*100) + "%";
    locationCorrect.style.left = ((card["location-coordinate"][1]+180)/360*100) + "%";
    locationMap.style.cursor = "pointer";
  }
  if (games.includes("artist")) {
    gameArtist.style.display = (card.artist) ? "grid" : "none";

    artistInput.classList.remove("correct", "almost-correct", "incorrect");
    artistInput.value = "";
    artistInput.disabled = false;
    artistFeedback.innerText = "";
  }
  if (games.includes("style")) {
    styleInput.classList.remove("correct", "almost-correct", "incorrect");
    styleInput.value = "";
    styleInput.disabled = false;
    styleFeedback.innerText = "";
  }
  if (games.includes("title")) {
    titleInput.classList.remove("correct", "almost-correct", "incorrect");
    titleInput.value = "";
    titleInput.disabled = false;
    titleFeedback.innerText = "";
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


const artistInput = document.getElementById("game-artist-input");
const artistFeedback = document.getElementById("game-artist-feedback");

const styleInput = document.getElementById("game-style-input");
const styleFeedback = document.getElementById("game-style-feedback");

const titleInput = document.getElementById("game-title-input");
const titleFeedback = document.getElementById("game-title-feedback");

function checkAnswer() {
  if (games.includes("date")) checkDate();
  
  if (games.includes("location")) checkLocation();

  if (games.includes("artist")) checkArtist();

  if (games.includes("style")) checkStyle();

  if (games.includes("title")) checkTitle();
}

function checkArtist() {
  if (!cards[0].artist) return;

  artistInput.disabled = true;
  artistFeedback.innerText = cards[0].artist[0];
  if (artistInput.value === "") {
    artistInput.classList.add("incorrect");
    return;
  }
  let artist = artistInput.value;
  let artistCorrect = cards[0].artist;

  let closest = 10000;
  let closestArtist;
  artistCorrect.forEach(a => {
    let distance = levenshtein(artist, a);
    if (distance < closest) {
      closest = distance;
      closestArtist = a;
    }
  })

  if (closest === 0) {
    artistInput.classList.add("correct");
    score += 1;
  } else if (closest < closestArtist.length/4) {
    artistInput.classList.add("almost-correct");
    score += 1-closest/closestArtist.length;
  } else {
    artistInput.classList.add("incorrect");
  }
}


function checkStyle() {
  styleInput.disabled = true;
  styleFeedback.innerText = cards[0].style.join(", ");
  if (styleInput.value === "") {
    styleInput.classList.add("incorrect");
    return;
  }
  let style = styleInput.value;
  let styleCorrect = cards[0].style;

  let closest = 10000;
  let closestStyle;
  styleCorrect.forEach(s => {
    let distance = levenshtein(style, s);
    if (distance < closest) {
      closest = distance;
      closestStyle = s;
    }
  })

  if (closest === 0) {
    styleInput.classList.add("correct");
    score += 1;
  } else if (closest < closestStyle.length/4) {
    styleInput.classList.add("almost-correct");
    score += 1-closest/closestStyle.length;
  } else {
    styleInput.classList.add("incorrect");
  }
}

function checkTitle() {
  titleInput.disabled = true;
  titleFeedback.innerText = chooseFirst(cards[0].title);
  if (titleInput.value === "") {
    titleInput.classList.add("incorrect");
    return;
  }
  let title = titleInput.value;
  let titleCorrect = cards[0].title;

  let closest = 10000;
  let closestTitle;
  if (typeof titleCorrect === "string") {
    closest = levenshtein(title, titleCorrect)
    closestTitle = titleCorrect;
  } else {
    titleCorrect.forEach(t => {
      let distance = levenshtein(title, t);
      if (distance < closest) {
        closest = distance;
        closestTitle = t;
      }
    })
  }

  if (closest === 0) {
    titleInput.classList.add("correct");
    score += 1;
  } else if (closest < closestTitle.length/4) {
    titleInput.classList.add("almost-correct");
    score += 1-closest/closestTitle.length;
  } else {
    titleInput.classList.add("incorrect");
  }
}


function checkDate() {
  dateInput.disabled = true;
  dateToggle.disabled = true;
  if (dateInput.value === "") {
    dateInput.classList.add("incorrect");
    dateFeedback.innerText = cards[0].date;
    return;
  }

  let date = Number(dateInput.value);
  if (dateStatus === "BCE") {
    date = -date;
  }

  let dateRange = cards[0]["date-range"];
  let dateNum = cards[0]["date-num"];
  if (typeof dateNum === "number") {
    if (date === dateNum) {
      dateInput.classList.add("correct");
      score += 1;
    } else if (date >= dateNum-dateRange && date <= dateNum+dateRange){
      dateInput.classList.add("almost-correct");
      score += 1-Math.abs(dateNum-date)/(dateRange*2);
    } else {
      dateInput.classList.add("incorrect");
    }
  } else {
    if (date >= dateNum[0] && date <= dateNum[1]) {
      dateInput.classList.add("correct");
      score += 1;
    } else if (date >= dateNum[0]-dateRange && date <= dateNum[1]+dateRange){
      dateInput.classList.add("almost-correct");
      if (date < dateNum[0]) {
        score += 1-Math.abs(dateNum[0]-date)/(dateRange*2);
      } else {
        score += 1-Math.abs(dateNum[1]-date)/(dateRange*2);
      }
    } else {
      dateInput.classList.add("incorrect");
    }
  }
  dateFeedback.innerText = cards[0].date;
}


function checkLocation() {
  locationMap.style.cursor = "not-allowed";
  
  locationCorrect.style.display = "flex";

  if (locationSelection.style.display === "none") {
    locationFeedback.innerText = cards[0].location;
  } else {
    let locSelectionX = Number.parseFloat(locationSelection.style.left)*3.6-180;
    let locSelectionY = 90-Number.parseFloat(locationSelection.style.top)*1.8;
    let locCorrectX = cards[0]["location-coordinate"][1];
    let locCorrectY = cards[0]["location-coordinate"][0];
    locSelectionX *= Math.PI/180;
    locSelectionY *= Math.PI/180;
    locCorrectX *= Math.PI/180;
    locCorrectY *= Math.PI/180;
    let radius = 3963.1;
    let calc = 1-Math.cos(locCorrectY)*Math.cos(locSelectionY)*Math.cos(locCorrectX-locSelectionX)-Math.sin(locCorrectY)*Math.sin(locSelectionY);
    let distance = 2*Math.asin(Math.sqrt(calc/2))*radius;

    locationFeedback.innerText = (new Intl.NumberFormat().format(Math.round(distance))) + " miles away; " + cards[0].location;
    if (distance < 250) {
      score += 1
    } else if (distance < 750) {
      score += 1-(distance-250)/750/2;
    }
  }
}


const locationSelection = document.getElementById("game-location-selection");
const locationCorrect = document.getElementById("game-location-correct");
const locationMap = document.getElementById("game-location-map");
const locationFeedback = document.getElementById("game-location-feedback");
locationMap.addEventListener("click", (event) => {
  if (locationCorrect.style.display !== "none") {
    return;
  }
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
  history.push({
    card: cards[0],
    title: identifierTitle.innerText,
    image: identifierImage.src,
    locationInput: [locationSelection.style.display === "flex", locationSelection.style.left, locationSelection.style.top],
    locationCorrect: [locationCorrect.style.left,locationCorrect.style.top],
    locationFeedback: locationFeedback.innerText,
    dateInput: dateInput.value,
    dateMode: dateToggle.innerText,
    dateFeedback: dateFeedback.innerText,
    dateStatus: dateInput.classList[0],
    artistInput: artistInput.value,
    artistFeedback: artistFeedback.innerText,
    artistStatus: artistInput.classList[0],
    styleInput: styleInput.value,
    styleFeedback: styleFeedback.innerText,
    styleStatus: styleInput.classList[0],
    titleInput: titleInput.value,
    titleFeedback: titleFeedback.innerText,
    titleStatus: titleInput.classList[0],
  })

  submitButton.hidden = false;
  continueButton.hidden = true;
  cards.shift();
  if (cards.length === 0) {
    gamePlayArea.style.display = "none";
    identifierImage.hidden = true;
    identifierTitle.hidden = true;
    gameFeedback.style.display = "grid";

    let points = Math.round(score*10)/10;
    if (points%1 === 0 ) points += ".0";

    gameScore.innerText = points;
    replayInstructions.hidden = false;
    clearInterval(timerInterval);
    timer.hidden = true;
    const diff = new Date().getTime() - time;
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const minutes = Math.floor(diff  / (1000 * 60));
    gameTime.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    locationMap.style.cursor = "not-allowed";
    styleInput.disabled = true;
    artistInput.disabled = true;
    dateInput.disabled = true;
    titleInput.disabled = true;

  } else {
    loadCard(cards[0]);
  }
})
const gameFeedback = document.getElementById("game-feedback");
const gameScore = document.getElementById("game-score");
const gamePlayArea = document.getElementById("game-play-area");
const replayInstructions = document.getElementById("game-replay");
const gameTime = document.getElementById("game-time");


const reviewButton = document.getElementById("review");
const reviewControls = document.getElementById("review-controls");
const reviewPrevious = document.getElementById("review-previous");
const reviewNext = document.getElementById("review-next");
reviewButton.addEventListener("click", () => {
  gamePlayArea.style.display = "flex";
  gameFeedback.style.display = "none";
  reviewControls.hidden = false;
  submitButton.hidden = true;
  continueButton.hidden = true;
  replayInstructions.hidden = true;

  switch (identifier) {
    case "image": {
      identifierImage.hidden = false;
      break;
    }
    case "title": {
      identifierTitle.hidden = false;
      break;
    }
    case "both": {
      identifierImage.hidden = false;
      identifierTitle.hidden = false;
      break;
    }
  }

  reviewIdx = 0;
  loadReviewCard(history[reviewIdx]);
})

function loadReviewCard(card) {
  switch (identifier) {
    case "image": {
      identifierImage.src = card.image;
      break;
    }
    case "title": {
      identifierTitle.innerText = card.title;
      break;
    }
    case "both": {
      identifierImage.src = card.image;
      identifierTitle.innerText = card.title;
      break;
    }
  }
  if (games.includes("location")) {
    locationFeedback.innerText = card.locationFeedback;
    locationCorrect.style.display = "flex";
    locationCorrect.style.left = card.locationCorrect[0];
    locationCorrect.style.top = card.locationCorrect[1];
    if (card.locationInput[0]) {
      locationSelection.style.display = "flex";
      locationSelection.style.left = card.locationInput[1];
      locationSelection.style.top = card.locationInput[2];
    } else locationSelection.style.display = "none";
  }
  if (games.includes("date")) {
    dateInput.value = card.dateInput;
    dateToggle.innerText = card.dateMode;
    dateFeedback.innerText = card.dateFeedback;
    dateInput.classList.remove("correct", "almost-correct", "incorrect");
    dateInput.classList.add(card.dateStatus);
  }
  if (games.includes("artist")) {
    if (card.card.artist) {
      gameArtist.style.display = "grid";
      artistInput.value = card.artistInput;
      artistFeedback.innerText = card.artistFeedback;
      artistInput.classList.remove("correct", "almost-correct", "incorrect");
      artistInput.classList.add(card.artistStatus);
    } else {
      gameArtist.style.display = "none";
    }
  }
  if (games.includes("style")) {
    styleInput.value = card.styleInput;
    styleFeedback.innerText = card.styleFeedback;
    styleInput.classList.remove("correct", "almost-correct", "incorrect");
    styleInput.classList.add(card.styleStatus);
  }
  if (games.includes("title")) {
    titleInput.value = card.titleInput;
    titleFeedback.innerText = card.titleFeedback;
    titleInput.classList.remove("correct", "almost-correct", "incorrect");
    titleInput.classList.add(card.titleStatus);
  }
}


reviewPrevious.addEventListener("click", () => {
  if (reviewIdx === 0) {
    gamePlayArea.style.display = "none";
    identifierImage.hidden = true;
    identifierTitle.hidden = true;
    gameFeedback.style.display = "grid";
    replayInstructions.hidden = false;
  } else {
    reviewIdx -= 1;
    loadReviewCard(history[reviewIdx]);
  }
})

reviewNext.addEventListener("click", () => {
  if (reviewIdx === history.length-1) {
    gamePlayArea.style.display = "none";
    identifierImage.hidden = true;
    identifierTitle.hidden = true;
    gameFeedback.style.display = "grid";
    replayInstructions.hidden = false;
  } else {
    reviewIdx += 1;
    loadReviewCard(history[reviewIdx]);
  }
})

const timer = document.getElementById("timer")
let time = new Date().getTime();
const timerInterval = setInterval(() => {
  const now = new Date().getTime();
  const diff = now - time;
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const minutes = Math.floor(diff  / (1000 * 60));
  timer.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}, 1000);


function shuffle(a,b,c){
  c=a.length;
  while(c){
    b=Math.random()*c--|0,[a[c],a[b]]=[a[b],a[c]]
  }
}

function chooseOne(i) {
  if (typeof i === "string") {
    return i;
  }
  return i[Math.floor(Math.random() * i.length)];
}

function chooseFirst(i) {
  if (typeof i === "string" || typeof i === "number") {
    return i;
  }
  return i[0];
}

function levenshtein(input, target) {
  input = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  target = target.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let v0 = [];
  for (let i = 0; i < target.length + 1; i++) v0.push(i)
  let v1 = new Array(target.length + 1);

  for (let i = 0; i < input.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < target.length; j++) {
      v1[j+1] = Math.min(
        v0[j+1] + 1, // deletion
        v1[j] + 1,   // insertion
        v0[j] + (input[i] === target[j] ? 0 : 1) // substitution
      );
    }
    [v0, v1] = [v1, v0]; // swap
  }
  return v0[target.length];
}