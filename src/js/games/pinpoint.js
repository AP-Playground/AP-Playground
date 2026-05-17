function optionsValidation(key, target) {
    if (key === "identifier" || key === "details") {
        if (options.identifier.some(i => options.details.includes(i))) {
            const repeat = vocabData.keys[options.identifier.filter(i => options.details.includes(i))[0]]
            alert(`You cannot select the same identifier ("${repeat}") and additional details ("${repeat}")!`)
            target.checked = false;
            target.dispatchEvent(new Event("change"))
        }
    }
}

function checkLoadGame() {
    let ready = true;
    for (const filter in filters) if (filters[filter].length === 0) ready = false;
    for (const option in options) if (options[option].length === 0 && option !== "details") ready = false;
    for (const setting in settings) if (settings[setting].length === 0) ready = false;
    if (settings.size[0] === "input" && !document.getElementById("setting-size-input").value) ready = false;

    if (ready) {
        gameBlock.inert = false;
        gameBlock.classList.add("active");
        loadGameTransition();
        if (initialPageLoad) {
            gameOverlay.style.transition = "none";
            gameBlock.scrollIntoView({behavior: "smooth", block: "center", container: "nearest"})
            gameOverlay.style.transition = "";
        }
    } else {
        gameBlock.inert = true;
        gameBlock.classList.remove("active")
    }
}

function loadGameTransition() {
    loadTerms();
    if (settings.size[0] === "all") {}
    else if (settings.size[0] === "input") {
        const sizeInput = document.getElementById("setting-size-input");
        if (availableTerms.length < Number(sizeInput.value)) {
            gameBlock.inert = true;
            gameBlock.classList.remove("active")
            alert(`There are not enough terms available (${availableTerms.length} terms) for your selected filters and game length (${sizeInput.value} terms)`);
            return;
        }
    } else {
        if (availableTerms.length < Number(settings.size[0])) {
            gameBlock.inert = true;
            gameBlock.classList.remove("active")
            alert(`There are not enough terms available (${availableTerms.length} terms) for your selected filters and game length (${settings.size[0]} terms)`);
            return;
        }
    }
    startTime = Date.now();
    if (firstGameLoad) {
        firstGameLoad = false;    
        loadGame()
    } else {
        unloadGame();
        setTimeout(() => loadGame(), 400);
    }
}

function unloadGame() {
    playArea.classList.add("init");
    identifierArea.classList.add("init");
};

function loadTerms() {
    const pinpointData = vocabData.games.pinpoint
    if (filters.hasOwnProperty("unit")) {
        availableTerms = [].concat(...filters.unit.map(unit => vocabData.units[unit]))
    } else {
        availableTerms = Object.keys(vocab);
    }
    availableTerms = [...new Set(availableTerms)];
    availableTerms = availableTerms.filter(key => {
        for (const filter in filters) {
            if (filter === "unit") continue;
            if (!getProperty(vocab[key], filter)) continue;
            if (!filters[filter].some(item => getProperty(vocab[key], filter).includes(item))) return false;
        }

        for (id of options.identifier) {
            if (!getProperty(vocab[key], id)) return false;
        }
        if (!getProperty(vocab[key], pinpointData.location)) return false;
        if (!getProperty(vocab[key], pinpointData["location-coordinate"])) return false;
        if (vocab[key][gameSlug + "-disable"]) return false;

        return true;
    })

}

let usedTerms;
let gameHistory;
let currentIdx;
let score;
function loadGame() {
    score = 0;
    currentIdx = 0;
    gameHistory = [];
    const weights = vocabData.filters.filter(filter => filter.hasOwnProperty("weights")).map((filter) => {
        return [filter.key, filter.values, filter.weights]
    })
    switch (settings.size[0]) {
        case "10": usedTerms = selectTerms(availableTerms, 10, weights); break;
        case "20": usedTerms = selectTerms(availableTerms, 20, weights); break;
        case "30": usedTerms = selectTerms(availableTerms, 30, weights); break;
        case "all": usedTerms = selectTerms(availableTerms, "all", weights); break;
        case "input": {
            const sizeInput = document.querySelector(`input#setting-size-input`)
            usedTerms = selectTerms(availableTerms, sizeInput.value, weights)
        }
    }
    
    loadBoard();
    populateBoard();
    resetBoard();
    progress.textContent = "0 / " + usedTerms.length;
    submitButton.hidden = false;
    continueButton.hidden = true;
    reviewNextButton.hidden = true;
    reviewPreviousButton.hidden = true;
    winModal.classList.add("hidden")
    playArea.classList.remove("init");
    identifierArea.classList.remove("init");
}

const detailContainer = game.querySelector(".detail-container");
const mapContainer = game.querySelector(".map-container");
const mapImages = mapContainer.querySelector(".map-images");
const map = mapImages.querySelector(".map");
const mapOverlay = mapImages.querySelector(".map-overlay");
const imageIdentifierContainer = game.querySelector(".image-identifier-container");
const imageIdentifier = imageIdentifierContainer.querySelector(".image-identifier");
const imageIdentifierLoading = imageIdentifierContainer.querySelector(".image-identifier-loading");
const textIdentifier = game.querySelector(".text-identifier");
const mapFeedback = game.querySelector(".map-feedback");
function loadBoard() {
    const gameData = vocabData.games.pinpoint;
    switch (gameData.map) {
        case "world": {
            map.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/960px-Blue_Marble_2002.png"
            mapOverlay.src = "/images/games/pinpoint/country-outline-overlay.svg"
        }
    }
    detailContainer.innerHTML = ""
    const dateToggles = [];
    for (const detail of options.details) {
        let temp = `<div class="detail-${detail}">`
        switch (gameData["detail-types"][detail].type) {
            case "text": {
                temp += `<label for="detail-${detail}-input">${vocabData.keys[detail]}:</label>`
                temp += `<input type="text" id="detail-${detail}-input" placeholder="${gameData["detail-types"][detail].placeholder}" autocomplete="off">`
                temp += `<span class="detail-${detail}-feedback"></span>`
                break;
            }
            case "year": {
                temp += `<label for="detail-${detail}-input">${vocabData.keys[detail]}:</label>`
                temp += `<div>`
                    temp += `<input type="number" id="detail-${detail}-input" placeholder="${gameData["detail-types"][detail].placeholder}" autocomplete="off">`
                    temp += `<button class="detail-${detail}-toggle" data-default-value="CE">CE</button>`
                temp += "</div>"
                temp += `<span class="detail-${detail}-feedback"></span>`
                dateToggles.push(`detail-${detail}-toggle`)
                break;
            }
        }
        temp += `</div>`
        detailContainer.insertAdjacentHTML("beforeend", temp)
    }
    dateToggles.forEach((val) => {
        detailContainer.querySelector("."+val).addEventListener("click", e => {
            e.target.textContent = e.target.textContent === "CE" ? "BCE" : "CE";
        })
    })
    imageIdentifierContainer.style.display = "none";
    textIdentifier.style.display = "none";
    for (const identifier of options.identifier) {
        if (gameData.term.includes(identifier)) {
            textIdentifier.style.display = "";
        } else if (gameData.termImage.includes(identifier)) {
            imageIdentifierContainer.style.display = "";
        }
    }
}

imageIdentifier.addEventListener("load", () => {
    imageIdentifier.style.opacity = 1;
    imageIdentifierLoading.style.opacity = 0;
})

const pinpoint = mapContainer.querySelector(".pinpoint");
const pinpointCorrect = mapContainer.querySelector(".pinpoint-correct");
function populateBoard() {
    const currentTerm = vocab[usedTerms[currentIdx]]
    const gameData = vocabData.games.pinpoint;
    pinpoint.hidden = true;
    pinpointCorrect.hidden = true;
    let foundDetail = false;
    for (const detail of options.details) {
        const detailElement = detailContainer.querySelector(`.detail-${detail}`)
        if (getProperty(currentTerm, detail)) {
            detailElement.style.display = "";
            foundDetail = true;
        } else {
            detailElement.style.display = "none";
        }
    }
    for (const identifier of options.identifier) {
        if (gameData.term.includes(identifier)) {
            textIdentifier.textContent = pickString(getProperty(currentTerm, identifier), false);
        } else {
            imageIdentifier.style.opacity = "";
            imageIdentifierLoading.style.opacity = "";
            imageIdentifier.src = pickString(getProperty(currentTerm, identifier));
            if (currentIdx + 1 < usedTerms.length) preloadImage(pickString(getProperty(vocab[usedTerms[currentIdx+1]], identifier)));
        }
    }
    detailContainer.style.display = foundDetail ? "" : "none"
    gameBoundResize()
}


const gameBoundObserver = new ResizeObserver(gameBoundResize);
gameBoundObserver.observe(gameBound)
window.addEventListener("resize", gameBoundResize)

const identifierArea = game.querySelector(".game-identifiers");
const playArea = game.querySelector(".game-play-area")
function gameBoundResize() {
    identifierArea.style.height = playArea.offsetHeight + "px"
}

map.addEventListener("click", movePinpoint)
map.addEventListener("mousedown", (e) => {
    movePinpoint(e)
    addEventListener("mousemove", movePinpoint)
})
addEventListener("mouseup", () => {
    removeEventListener("mousemove", movePinpoint)
})
function movePinpoint(e) {
    const rect = map.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x /= rect.width;
    y /= rect.height;
    x *= 100;
    y *= 100;
    x = Math.min(Math.max(x, 0), 100);
    y = Math.min(Math.max(y, 0), 100);
    
    pinpoint.style.setProperty('--x', x + "%");
    pinpoint.style.setProperty('--y', y + "%");
    if (pinpoint.hidden) {
        pinpoint.style.opacity = 0;
        pinpoint.hidden = false;
        pinpoint.getBoundingClientRect();
        pinpoint.style.opacity = "";
    }
}


function resetBoard() {
    map.style.pointerEvents = "";
    mapContainer.style.cursor = "";
    detailContainer.querySelectorAll("input").forEach(input => {
        input.disabled = false
        input.classList.remove("correct","partial-correct","incorrect")
        input.value = ""
    });
    detailContainer.querySelectorAll("button").forEach(button => {
        button.disabled = false;
        button.textContent = button.dataset.defaultValue
    });
    detailContainer.querySelectorAll(":scope > div > span").forEach(feedback => feedback.textContent = "")
    pinpoint.hidden = true;
    pinpointCorrect.hidden = true;
    mapFeedback.textContent = "(Click on the map to select a location)";
}

function lockBoard() {
    map.style.pointerEvents = "none";
    mapContainer.style.cursor = "not-allowed";
    detailContainer.querySelectorAll("input").forEach(input => input.disabled = true);
    detailContainer.querySelectorAll("button").forEach(button => button.disabled = true);
}
const submitButton = playArea.querySelector(".submit-game");
const continueButton = playArea.querySelector(".continue-game");

submitButton.addEventListener("click", () => {
    lockBoard();
    submitButton.hidden = true;
    continueButton.hidden = false;

    checkAnswers();
})

const winModal = game.querySelector(".game-win-modal");
const gameAccuracy = game.querySelector(".game-accuracy");
const gameTime = game.querySelector(".game-time");
let startTime;
continueButton.addEventListener("click", () => {
    currentIdx++;
    progress.textContent = currentIdx + " / " + usedTerms.length;
    if (currentIdx === usedTerms.length) {
        gameAccuracy.textContent = "Accuracy: " + round(score / usedTerms.length * 100, 1) + "%"
        gameTime.textContent = "Time: " + formatTime(Date.now() - startTime);
        winModal.classList.remove("hidden");
        playArea.classList.add("init");
        identifierArea.classList.add("init");
        return;
    }
    submitButton.hidden = false;
    continueButton.hidden = true;
    resetBoard();
    populateBoard();
})

const gameReview = game.querySelector(".game-review");
const gameReplay = game.querySelector(".game-replay");
const reviewNextButton = game.querySelector(".review-next");
const reviewPreviousButton = game.querySelector(".review-previous");

gameReplay.addEventListener("click", checkLoadGame);

gameReview.addEventListener("click", () => {
    continueButton.hidden = true;
    submitButton.hidden = true;
    reviewNextButton.hidden = false;
    reviewPreviousButton.hidden = false;
    playArea.classList.remove("init");
    identifierArea.classList.remove("init");
    currentIdx = 0;
    loadReview();
    winModal.classList.add("hidden");
})

reviewNextButton.addEventListener("click", () => {
    currentIdx++;
    if (currentIdx === usedTerms.length) {
        winModal.classList.remove("hidden");
        playArea.classList.add("init");
        identifierArea.classList.add("init");
        return;
    }
    loadReview();
})

reviewPreviousButton.addEventListener("click", () => {
    currentIdx--;
    if (currentIdx < 0) {
        winModal.classList.remove("hidden");
        playArea.classList.add("init");
        identifierArea.classList.add("init");
        return;
    }
    loadReview();
})

function loadReview() {
    populateBoard();
    resetBoard();
    lockBoard();
    progress.textContent = (currentIdx+1) + " / " + usedTerms.length;

    for (const [key, value] of Object.entries(gameHistory[currentIdx])) {
        if (key === "pinpoint-x" || key === "pinpoint-y") {
            pinpoint.style.setProperty(`--${key[9]}`, value)
            pinpoint.hidden = false;
        } else if (key[0] === "#") {
            game.querySelector(key).value = value;
        } else if (key[0] === ".") {
            game.querySelector(key).textContent = value;
        }
    }

    checkAnswers(true);
}

function checkAnswers(review = false) {
    let totalInputs = 1;
    let totalInputsAccuracy = 0;
    const inputs = {};

    const pinpointData = vocabData.games.pinpoint
    const currentTerm = vocab[usedTerms[currentIdx]]
    for (const detail of options.details) {
        if (!getProperty(currentTerm, detail)) continue;

        const detailElement = detailContainer.querySelector(".detail-"+detail)
        const detailFeedbackElement = detailElement.querySelector(`.detail-${detail}-feedback`)
        const detailInputElement = detailElement.querySelector(`#detail-${detail}-input`);
        let correctAnswer = getProperty(currentTerm, detail);
        detailFeedbackElement.textContent = pickString(correctAnswer, false);
        inputs[`#detail-${detail}-input`] = detailInputElement.value;
        currentInputAccuracy = 0;
        
        switch (pinpointData["detail-types"][detail].type) {
            case "text": {
                const inputtedText = detailInputElement.value;
                if (inputtedText === "") break;
                let closest = 10000;
                let closestMatch;
                if (typeof correctAnswer === "string") correctAnswer = [correctAnswer]
                correctAnswer.forEach(a => {
                    let distance = levenshtein(inputtedText, a);
                    if (distance < closest) {
                        closest = distance;
                        closestMatch = a;
                    }
                })
                if (closest === 0) currentInputAccuracy = 1;
                else if (closest < closestMatch.length/4) currentInputAccuracy = 1-closest/closestMatch.length;
                break;
            }
            case "year": {
                let inputtedYear = detailInputElement.value;
                const yearToggle = detailElement.querySelector(`.detail-${detail}-toggle`)
                inputs[`.detail-${detail}-toggle`] = yearToggle.textContent;
                if (inputtedYear === "") break;
                if (yearToggle.textContent === "BCE") inputtedYear *= -1;
                const yearNum = getProperty(currentTerm, detail+"-num");
                const yearRange = getProperty(currentTerm, detail+"-range");
                
                if (typeof yearNum === "number") {
                    currentInputAccuracy += Math.max(Math.min(2 - Math.abs(yearNum - inputtedYear)/yearRange, 1), 0);
                } else {
                    const centerYear = (yearNum[0] + yearNum[1])/2
                    if (yearNum[0] <= inputtedYear && inputtedYear <= yearNum[1]) currentInputAccuracy++;
                    else currentInputAccuracy += Math.max(Math.min(2 - Math.abs(centerYear - inputtedYear)/yearRange, 1), 0);
                }
            }
        }

        if (currentInputAccuracy === 1) detailInputElement.classList.add("correct");
        else if (currentInputAccuracy > 0) detailInputElement.classList.add("partial-correct");
        else detailInputElement.classList.add("incorrect");
        
        totalInputs++;
        totalInputsAccuracy += currentInputAccuracy
    }

    const currentCoordinate = getCoordinate(pinpoint)
    const locationCoordinate = getProperty(currentTerm, pinpointData["location-coordinate"]);
    if (!pinpoint.hidden) {
        const locSelected = currentCoordinate.map(i => i*Math.PI/180);
        const locCorrect = locationCoordinate.map(i => i*Math.PI/180);
        const radius = 3963.1;
        const calc = 1 - Math.cos(locCorrect[0])*Math.cos(locSelected[0])*Math.cos(locCorrect[1]-locSelected[1]) - Math.sin(locCorrect[0])*Math.sin(locSelected[0]);
        const distance = 2 * radius * Math.asin(Math.sqrt(calc/2))
        mapFeedback.textContent = round(distance, 1) + " miles away; " + getProperty(currentTerm, pinpointData.location);
        totalInputsAccuracy += Math.min(1, Math.max(0, 1-(distance-250)/750))
        const computedStyles = window.getComputedStyle(pinpoint)
        inputs["pinpoint-x"] = computedStyles.getPropertyValue("--x")
        inputs["pinpoint-y"] = computedStyles.getPropertyValue("--y")
    } else {
        mapFeedback.textContent = "No location selected; " + getProperty(currentTerm, pinpointData.location)
    }
    pinpointCorrect.style.setProperty('--x', (locationCoordinate[1]+180)/360*100 + "%");
    pinpointCorrect.style.setProperty('--y', (90-locationCoordinate[0])/180*100 + "%");
    pinpointCorrect.hidden = false;

    if (!review) {
        score += totalInputsAccuracy / totalInputs;
        gameHistory.push(inputs);
    }
}

function getCoordinate(element) {
    const computedStyles = window.getComputedStyle(element)
    let x = Number.parseFloat(computedStyles.getPropertyValue("--x"));
    let y = Number.parseFloat(computedStyles.getPropertyValue("--y"));
    x *= 360/100;
    y *= 180/100;
    x -= 180;
    y = 90-y;
    return [y,x]
}


const progress = moduleControls.querySelector(".progress");
const replayBtn = moduleControls.querySelector(".replay");

replayBtn.addEventListener("click", checkLoadGame);

document.querySelector(".image-identifier-container").addEventListener("click", () => {
    imgEnlarged.src = "";
    imgEnlarged.src = imageIdentifier.src;
})
const imageIdentifierMagnifyBtn = imageIdentifierContainer.querySelector(".image-identifier-magnify")
imageIdentifierMagnifyBtn.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        imageIdentifierMagnifyBtn.focus();
        imgEnlarged.src = "";
        imgEnlarged.src = imageIdentifier.src;
    }
})