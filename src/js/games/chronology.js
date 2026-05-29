function checkLoadGame() {
    let ready = true;
    for (const filter in filters) if (filters[filter].length === 0) ready = false;
    for (const option in options) if (options[option].length === 0) ready = false;
    for (const setting in settings) if (settings[setting].length === 0) ready = false;
    if (settings.timer[0] === "input" && !document.getElementById("setting-timer-input").value) ready = false;

    if (ready) {
        gameBlock.inert = false;
        gameBlock.classList.add("active");
        if (initialPageLoad || firstGameLoad) {
            setTimeout(() => {
                gameBlock.scrollIntoView({behavior: "smooth", block: "center", container: "nearest"})
            }, 0);
        }
        loadGameTransition();
    } else {
        gameBlock.inert = true;
        gameBlock.classList.remove("active")
    }
}

function loadGameTransition() {
    loadTerms()
    if (availableTerms.length < 5) {
        gameBlock.inert = true;
        gameBlock.classList.remove("active")
        alert(`There are not enough terms available (${availableTerms.length} terms) for your selected filters. Please adjust your filters and try again.`);
        return;
    }
    if (firstGameLoad) {
        firstGameLoad = false;    
        loadGame()
    } else {
        unloadGame();
        setTimeout(() => loadGame(), 400);
    }
}

let availableTerms = [];
function loadTerms() {
    const gameData = vocabData.games[gameSlug];
    const checkKeys = [gameData.term, gameData.date, gameData["date-num"]];
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

        if (checkKeys.some(checks => !getProperty(vocab[key], checks))) return false;
        if (vocab[key][gameSlug + "-disable"]) return false;

        return true;
    })
}

const winModal = gameBlock.querySelector(".game-win-modal");
const playArea = gameBlock.querySelector(".game-play-area");
const identifierArea = gameBlock.querySelector(".game-identifiers");
const textIdentifier = identifierArea.querySelector(".text-identifier");
const imageIdentifierContainer = identifierArea.querySelector(".image-identifier-container");
const imageIdentifierLoading = imageIdentifierContainer.querySelector(".image-identifier-loading");
const imageIdentifier = imageIdentifierContainer.querySelector(".image-identifier");
const hintContainer = identifierArea.querySelector(".hint-container");

let currentIdx;
let currentTermOrder;
function loadGame() {
    availableTerms = selectTerms(availableTerms, "all");
    currentIdx = 0;
    currentTermOrder = [];
    winModal.classList.add("hidden")
    playArea.classList.remove("init");
    identifierArea.classList.remove("init");
    imageIdentifierContainer.style.display = "none";
    textIdentifier.style.display = "none";
    loadIdentifiers();
    loadBoard();
}

function loadIdentifiers() {
    const gameData = vocabData.games[gameSlug];
    const term = vocab[availableTerms[currentIdx]];
    const text = getProperty(term, gameData.term);
    const image = getProperty(term, gameData.image);
    const hints = gameData.hints;

    if (text) {
        textIdentifier.textContent = pickString(text, false);
        textIdentifier.style.display = "block";
    } else textIdentifier.style.display = "none";
    if (image) {
        imageIdentifier.src = pickString(image, false);
        imageIdentifierContainer.style.display = "grid";
        imageIdentifier.style.opacity = "";
        imageIdentifierLoading.style.opacity = "";
        if (currentIdx + 1 < availableTerms.length) preloadImage(pickString(getProperty(vocab[availableTerms[currentIdx+1]], gameData.image)), false);
    } else imageIdentifierContainer.style.display = "none";

    switch(settings.hints[0]) {
        case "none": {
            hintContainer.innerHTML = "";
            break;
        }
        case "one": {
            const output = [];
            for (const hint of hints) {
                let success = true;
                let temp = hint.replace(/\$\{([^}]+)\}/g, (match, key) => {
                    return key in term && term[key] ? pickString(term[key], false) : success = false;
                });
                if (!success) continue;
                output.push(temp)
            }
            hintContainer.innerHTML = "<p>" + pickString(output) + "</p>";
            break;
        }
        case "all": {
            const output = [];
            for (const hint of hints) {
                let success = true;
                let temp = hint.replace(/\$\{([^}]+)\}/g, (match, key) => {
                    return key in term && term[key] ? pickString(term[key], false) : success = false;
                });
                if (!success) continue;
                output.push(temp)
            }
            hintContainer.innerHTML = output.map(hint => `<p>${hint}</p>`).join("");
            break
        }
    }
}

imageIdentifier.addEventListener("load", () => {
    imageIdentifier.style.opacity = 1;
    imageIdentifierLoading.style.opacity = 0;
})

function unloadGame() {
    playArea.classList.add("init");
    identifierArea.classList.add("init");
};

const termContainer = playArea.querySelector(".term-container");
function loadBoard() {
    termContainer.innerHTML = `<div class="term hidden"><button onclick=tryInsertTerm(-1)></button></div>`;
}

function tryInsertTerm(termIdx) {
    if (termIdx === -1) {
        currentTermOrder.push(availableTerms[currentIdx]);
        displayTerms();
        currentIdx++;
        loadIdentifiers();
        return
    }

    let correctMatch = false;
    if (termIdx === currentTermOrder.length) {
        if (compareDates(availableTerms[currentIdx], currentTermOrder[termIdx-1]) >= 0) correctMatch = true;
    } else if (termIdx === 0) {
        if (compareDates(availableTerms[currentIdx], currentTermOrder[0]) <= 0) correctMatch = true;
    } else {
        if (compareDates(availableTerms[currentIdx], currentTermOrder[termIdx-1]) >= 0 && compareDates(availableTerms[currentIdx], currentTermOrder[termIdx]) <= 0) correctMatch = true;
    }

    if (correctMatch) {
        currentTermOrder.splice(termIdx, 0, availableTerms[currentIdx]);
        displayTerms();
        currentIdx++;
        loadIdentifiers();
    } else {
        gameOver();
    }
}

const winModalScore = winModal.querySelector(".game-score");
const gameReplay = winModal.querySelector(".game-replay");
const gameReview = winModal.querySelector(".game-review");
function gameOver() {
    winModalScore.textContent = `Correct terms: ${currentIdx}`
    winModal.classList.remove("hidden");
    playArea.classList.add("init");
    identifierArea.classList.add("init");
}

gameReview.addEventListener("click", () => {
    winModal.classList.add("hidden");
    playArea.classList.remove("init");
    identifierArea.classList.remove("init");
    playArea.querySelectorAll(".term button").forEach(btn => btn.remove());

    const gameData = vocabData.games[gameSlug];
    const term = vocab[availableTerms[currentIdx]];
    const text = getProperty(term, gameData.term);
    const date = getProperty(term, gameData.date);
    textIdentifier.innerHTML = pickString(text, false) + `<br><span>${pickString(date, false)}</span>`;
});

gameReplay.addEventListener("click", checkLoadGame);

// negative if term1 is earlier, positive if term2 is earlier, 0 if they are the same or overlapping
function compareDates(term1, term2) {
    const gameData = vocabData.games[gameSlug];
    const date1 = getProperty(vocab[term1], gameData["date-num"]);
    const date2 = getProperty(vocab[term2], gameData["date-num"]);
    if (typeof date1 === "number" && typeof date2 === "number") {
        if (date1 === date2) return 0;
        return date1 - date2;
    }
    if (typeof date1 === "number") {
        if (date1 < date2[0]) return -1;
        if (date1 > date2[1]) return 1;
        return 0
    }
    if (typeof date2 === "number") {
        if (date2 < date1[0]) return 1;
        if (date2 > date1[1]) return -1;
        return 0
    }
    if (date1[1] < date2[0]) return -1;
    if (date1[0] > date2[1]) return 1;
    return 0;
}

function displayTerms() {
    const gameData = vocabData.games[gameSlug];
    const backgroundStart = `linear-gradient(#fffa, #fffa)`
    const termList = currentTermOrder.map(term => vocab[term]).map((term,idx) => 
        `<div class="term" style="background-image:${backgroundStart}, url(${pickString(getProperty(term, gameData.image), false)})"><p>${pickString(getProperty(term, gameData.term), false)}</p><p>${getProperty(term, gameData.date)}</p>${idx===0?"<button class=initial onclick=tryInsertTerm(0)></button>":""}<button onclick=tryInsertTerm(${idx+1})></button></div>`
    );
    termContainer.innerHTML = termList.join("");
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