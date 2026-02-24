const courseSelect = document.querySelector("#course-select")
const gameBlock = document.querySelector(".game-block")
gameBlock.inert = true;

const gameFilters = document.querySelector(".game-filters")
const gameOptions = document.querySelector(".game-options")
const gameSettings = document.querySelector(".game-settings")
const settingData = JSON.parse(gameSettings.innerHTML)
gameSettings.innerHTML = "";
gameSettings.hidden = false;

let filters = {};
let options = {};
let settings = {};

let vocab;
let vocabData;
let courseNav;

let firstGameLoad = true;
let initialPageLoad = true;

const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);

courseSelect.addEventListener("change", async () => {
    gameBlock.inert = true;
    gameBlock.classList.remove("active");
    gameFilters.innerHTML = ""
    gameOptions.innerHTML = ""
    gameSettings.innerHTML = ""
    filters = {};
    options = {};
    settings = {};

    [vocab, vocabData, courseNav] = await Promise.all([
        loadJSON(`/${courseSelect.value}/vocab.json`),
        loadJSON(`/${courseSelect.value}/vocab-data.json`),
        loadJSON(`/${courseSelect.value}/nav.json`)
    ]);

    loadOptions();

    if (initialPageLoad && searchParams.has("course")) {
        for (const [key, val] of searchParams) {
            if (key === "course") continue;
            const checked = document.querySelector(`.${key}[value="${val}"]`)
            if (checked) {
                checked.checked = true;
                checked.dispatchEvent(new Event('change'))
            }
        }
    }
    initialPageLoad = false;
})

if (searchParams.has("course")) {
    courseSelect.value = searchParams.get("course")
    courseSelect.dispatchEvent(new Event('change'));
}

function loadOptions() {
    for (const filter of vocabData.filters) {
        let values;
        let displayValues;
        if (filter.key === "unit") {
            values = Object.keys(courseNav.data);
            displayValues = Object.values(courseNav.data).map(i => i.prefix + ": " + i.title);
        } else {
            values = vocabData.values;
            displayValues = vocabData.displayValues;
        }
        fieldset(gameFilters, filter.key, filter.displayKey, values, displayValues, filter.multiselect, filter.all, "filter")
    }

    for (const setting of settingData) {
        fieldset(gameSettings, setting.key, setting.displayKey, setting.values, setting.displayValues, setting.multiselect, setting.all, "setting")
    }

    const keyNames = vocabData.keys
    const memoryData = vocabData.games.memory
    const identifierOptions = [...memoryData.term, ...memoryData.termImage]
    if (identifierOptions.length > 1) {
        fieldset(gameOptions, "identifier", "Identifier", identifierOptions, identifierOptions.map(i => keyNames[i]), false, false, "option")
    } else {
        options["identifier"] = [memoryData.term[0] || memoryData.termImage[0]];
    }
    
    const infoOptions = [...memoryData.text, ...memoryData.image];
    if (infoOptions.length > 1) {
        fieldset(gameOptions, "info", "Card information", infoOptions, infoOptions.map(i => keyNames[i]), false, false, "option")
    } else {
        options["info"] = [memoryData.text[0] || memoryData.image[0]];
    }
}

function fieldset(element, key, displayKey, values, displayValues, multiselect, all, option) {
    const type = multiselect ? "checkbox" : "radio"
    let field = ""
    for (const i in values) {
        field += `<label><input type="${type}" name="${key}" value="${values[i]}" class="${option}-${key}">${displayValues[i]}</label>`
    }
    if (all) field += `<label><input type="${type}" name="${key}" value="select-all" class="${option}-${key} select-all">All ${displayKey.toLowerCase()}</label>`
    element.insertAdjacentHTML("beforeend",`<fieldset><legend>${displayKey}</legend>${field}</fieldset>`)

    const list = option==="filter"?filters:option==="option"?options:settings
    list[key] = []

    const inputs = Array.from(document.querySelectorAll(`.${option}-${key}:not(.select-all)`))
    inputs.forEach(i => i.addEventListener("change", e => {
        list[key] = inputs.filter(i => i.checked).map(i => i.value);

        if (option === "option" && options.identifier[0] === options.info[0]) {
            const repeat = vocabData.keys[list[key][0]]
            alert(`You cannot select the same identifier ("${repeat}") and card information ('${repeat}")!`)
            e.target.checked = false;
            return;
        }

        checkLoadGame();
    }))

    if (all) {
        const selectAll = document.querySelector(`.${option}-${key}.select-all`);
        inputs.forEach(i => i.addEventListener("change", () => {
            selectAll.checked = !inputs.some(box => !box.checked)
        }))
        selectAll.addEventListener("change", () => {
            inputs.forEach(box => box.checked = selectAll.checked);
            list[key] = inputs.filter(i => i.checked).map(i => i.value);

            checkLoadGame()
        })
    }
}

const gameOverlay = gameBlock.querySelector(".overlay");
function checkLoadGame() {
    let ready = true;
    for (const filter in filters) if (filters[filter].length === 0) ready = false;
    for (const option in options) if (options[option].length === 0) ready = false;
    for (const setting in settings) if (settings[setting].length === 0) ready = false;
    if (options.info[0] === options.identifier[0]) ready = false;

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
    loadTerms()
    if (availableTerms.length < Number(settings.size[0])) {
        gameBlock.inert = true;
        gameBlock.classList.remove("active")
        alert("There are not enough terms available with your selected filters and game settings");
        return;
    }
    startTime = Date.now();
    if (firstGameLoad) {
        firstGameLoad = false;
        loadGame()
    } else {
        const tiles = document.querySelectorAll(".game-tile:not(.correct)");
        const length = tiles.length;
        if (length === 0) {
            winModal.classList.add("hidden")
            setTimeout(() => {
                winModal.hidden = true;
                loadGame()
            }, 500)
        } else {
            tiles.forEach(tile => tile.classList.add("init"))
            tiles.forEach(tile => tile.inert = true)
            tiles.forEach((tile,i) => tile.style.setProperty("--index", length - i - 1))
            setTimeout(() => {
                loadGame()
            }, 25 * tiles.length)
        }
    }
}

let availableTerms;
let players;

function loadGame() {
    correct = 0;
    incorrect = 0;
    turn = 0;
    selected = undefined;
    players = Number(settings.player[0])
    playerCorrect = [0,0,0]
    loadBoard()
    fillBoard()
    functionBoard()
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.querySelectorAll(".game-tile.init").forEach(i => i.classList.remove("init"))
        })
    })
}

function loadTerms() {
    if (filters.hasOwnProperty("unit")) {
        availableTerms = [].concat(...filters.unit.map(unit => vocabData.units[unit]))
    } else {
        availableTerms = Object.keys(vocab);
    }
    availableTerms = [...new Set(availableTerms)];
    availableTerms = availableTerms.filter(key => {
        for (const filter in filters) {
            if (filter === "unit") continue;
            if (!filters[filter].some(item => vocab[key][filter].includes(item))) return false;
        }

        if (!hasProperty(vocab[key], options.info[0])) return false;
        if (!hasProperty(vocab[key], options.identifier[0])) return false;
        if (vocab[key].hasOwnProperty("memory-disable") && vocab[key]["memory-disable"]) return false;

        return true;
    })
}

function hasProperty(term, key) {
    if (term.hasOwnProperty("memory-"+key)) {
        return term["memory-"+key];
    } else return term.hasOwnProperty(key)
}

const gameBound = gameBlock.querySelector(".game-bound")
const game = gameBound.querySelector(".game");

function loadBoard() {
    game.innerHTML = ""
    let tiles = Number(settings.size[0]);
    switch (tiles) {
        case 10: {
            game.style.setProperty("--landscape-columns", 5)
            game.style.setProperty("--portrait-columns", 4)
            cardRatio = [4,5]
            break;
        }
        case 15: {
            game.style.setProperty("--landscape-columns", 6)
            game.style.setProperty("--portrait-columns", 5)
            cardRatio = [5,6]
            break;
        }
        case 21: {
            game.style.setProperty("--landscape-columns", 7)
            game.style.setProperty("--portrait-columns", 6)
            cardRatio = [6,7]
        }
    }
    for (let i = 0; i < tiles * 2; i++) {
        game.insertAdjacentHTML("beforeend", `<button class="game-tile init" data-key="" style="--index:${i}"><div class="front"></div><div class="back"></div></button>`)
    }
    gameBoundResize()
}

const gameBoundObserver = new ResizeObserver(gameBoundResize);
gameBoundObserver.observe(gameBound)
window.addEventListener("resize", gameBoundResize)
let cardRatio;

function gameBoundResize() {
    if (!cardRatio) return;

    const maxWidth = gameBound.offsetWidth;
    const gap = maxWidth * 0.0025 * (8 - cardRatio[1])

    let maxHeight = window.innerHeight - 40 - 10 - 45;
    if (players > 1) maxHeight -= 39

    const maxLandscapeWidth = Math.min(maxWidth, ((maxHeight - gap*(cardRatio[0]-1))/cardRatio[0])*4/3*cardRatio[1]+gap*(cardRatio[0]));
    const maxPortraitWidth = Math.min(maxWidth, ((maxHeight - gap*cardRatio[0])/cardRatio[1])*4/3*cardRatio[0]+gap*(cardRatio[0]-1))

    let landscapeCardWidth = (maxLandscapeWidth - gap * cardRatio[0])/cardRatio[1]
    let portraitCardWidth = (maxPortraitWidth - gap * (cardRatio[0]-1))/cardRatio[0]

    if (portraitCardWidth > landscapeCardWidth) {
        gameBound.style.height = (portraitCardWidth*0.75*cardRatio[1] + gap*cardRatio[0]) + "px";
        game.classList.add("portrait")
        game.style.width = maxPortraitWidth + "px";
    } else {
        gameBound.style.height = (landscapeCardWidth*0.75*cardRatio[0] + gap*(cardRatio[0]-1)) + "px";
        game.classList.remove("portrait")
        game.style.width = maxLandscapeWidth + "px";
    }
}

let cardPairs;
function fillBoard() {
    const usedTerms = randomize(availableTerms).slice(0,settings.size[0])
    const tempElement = document.createElement("div");
    const tempElement2 = document.createElement("div");
    cardPairs = []
    const cardText = [];
    const data = vocabData.games.memory;
    const hideShowArray = []
    const identifier = options.identifier[0]
    const info = options.info[0]
    const randomizeIdentifier = data.randomize.includes(identifier)
    const randomizeInfo = data.randomize.includes(info)

    for (const term of usedTerms) {
        let identifierHTML = vocab[term]["memory-"+identifier] || vocab[term][identifier]
        identifierHTML = pickString(identifierHTML, randomizeIdentifier);
        if (data.termImage.includes(identifier)) identifierHTML = imageZoom(identifierHTML);
        cardText.push(identifierHTML)
        
        let infoHTML = vocab[term]["memory-"+info] || vocab[term][info]
        infoHTML = pickString(infoHTML, randomizeInfo)
        if (data.image.includes(info)) infoHTML = imageZoom(infoHTML);
        cardText.push(infoHTML)

        tempElement.innerHTML = identifierHTML;
        tempElement2.innerHTML = infoHTML;
        cardPairs.push([tempElement.innerHTML, tempElement2.innerHTML])
        hideShowArray.push("hide","show")
    }
    randomize(cardText);
    randomize(hideShowArray)
    const gameTileBack = document.querySelectorAll(".game-tile .back")

    document.querySelectorAll(".game-tile").forEach((e,i) => {
        gameTileBack[i].innerHTML = cardText[i]
        if (settings.mode[0] === "easy") e.classList.add("show");
        else if (settings.mode[0] === "medium") e.classList.add(hideShowArray[i])
        else if (settings.mode[0] === "hard") e.classList.add("hide")
    })
}

let mode;

function functionBoard() {
    mode = settings.mode[0]
    const gameTiles = document.querySelectorAll(".game-tile")
    updateProgress();
    gameTiles.forEach(tile => {
        tile.inert = true;
        tile.querySelector(".front").inert = false;
        tile.querySelector(".back").inert = true;
        tile.addEventListener("click", e => {
            if (e.target.classList.contains("magnify")) return;
            handleFlip(tile);
            updateProgress();
        })
    })
    setTimeout(() => {
        gameTiles.forEach(tile => tile.inert = false)
        gameTiles.forEach(tile => {
            if (tile.classList.contains("show")) flipCard(tile)}
        )
    }, 25 * gameTiles.length)

    document.querySelectorAll(".magnify").forEach(btn => {
        const img = btn.parentNode.querySelector(".img")
        btn.addEventListener("click", () => {
            imgEnlarged.src = "";
            imgEnlarged.src = img.src;
        })
        btn.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                btn.focus()
                imgEnlarged.src = "";
                imgEnlarged.src = img.src;
            }
        })
    })
}

function flipCard(card) {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back")
    if (card.classList.contains("flipped")) {
        card.classList.remove("flipped")
        front.inert = false;
        back.inert = true;
    } else {
        card.classList.add("flipped")
        front.inert = true;
        back.inert = false;
    }
}

let selected;
let turn;

function handleFlip(tile) {
    if (selected && selected === tile) return;
    tile.classList.add("selected")

    const prevSelected = selected;

    if (tile.classList.contains("hide")) flipCard(tile)
    if (!selected) {
        selected = tile;
        return;
    }

    const correctMatch = cardPairs.some(p => p.includes(selected.querySelector(".back").innerHTML) && p.includes(tile.querySelector(".back").innerHTML)) && selected.innerHTML !== tile.innerHTML;
    const delay = tile.classList.contains("hide")? 2000 : 0;

    if (correctMatch) {
        tile.inert = true;
        selected.inert = true;

        setTimeout(() => {
            tile.classList.add("correct")
            prevSelected.classList.add("correct")
            tile.classList.remove("selected")
            prevSelected.classList.remove("selected")
            if (correct == settings.size[0]) gameOver();
        }, delay)
        correct++;
        playerCorrect[turn%players]++
    } else {
        gameBound.inert = true;
        setTimeout(() => {
            gameBound.inert = false;
            if (tile.classList.contains("hide")) flipCard(tile);
            if (prevSelected.classList.contains("hide")) flipCard(prevSelected)
            tile.classList.remove("selected")
            prevSelected.classList.remove("selected")
        }, delay)
        incorrect++
    }
    selected = undefined;
    turn++;
}

const winModal = gameBound.querySelector(".win-modal")
const winAccuracy = winModal.querySelector(".win-accuracy");
const winTime = winModal.querySelector(".win-time")
let startTime;
function gameOver() {
    winModal.hidden = false;
    if (players === 1) {
        winAccuracy.textContent = "Accuracy: " + (Math.round(correct/(correct+incorrect)*100)) + "%";
    } else {
        let message = ""
        const maxScore = Math.max(...playerCorrect)
        const winners = playerCorrect.map((score,i) => score===maxScore?i+1:0).filter(i => i>0);
        if (winners.length === 3) message += "Players 1, 2, and 3 tie";
        else if (winners.length === 2) message += `Players ${winners[0]} and ${winners[1]} tie`
        else message += `Player ${winners[0]}`
        winAccuracy.innerHTML = "Winner: <b>"+message+"</b>";
    }
    startTime = (Date.now() - startTime)/1000
    const minutes = Math.floor(startTime/60)
    let seconds = Math.round(startTime - minutes * 60)
    seconds = seconds < 10 ? "0" + seconds : seconds
    winTime.textContent = "Time: " + minutes + ":" + seconds;
    requestAnimationFrame(() => {
        winModal.classList.remove("hidden")
    })
}

const moduleControls = gameBlock.querySelector(".module-controls");
const fullscreenBtn = moduleControls.querySelector(".fullscreen");
const copyLinkBtn = moduleControls.querySelector(".copy-link");
const progress = moduleControls.querySelector(".progress");
const replayBtn = moduleControls.querySelector(".replay");

replayBtn.addEventListener("click", loadGameTransition);

const multiplayerInfo = gameBlock.querySelector(".multiplayer-info")
const playerProgress = multiplayerInfo.querySelectorAll("div")
let correct;
let playerCorrect;
let incorrect;
function updateProgress() {
    progress.textContent = correct + " / " + (settings.size[0])
    if (players === 1) multiplayerInfo.style.display = "none";
    else {
        multiplayerInfo.style.display = "";
        playerProgress.forEach((e,i) => {
            e.hidden = i > players-1
            e.textContent = `Player ${i+1}: ${playerCorrect[i]}`
            e.classList.toggle("selected", turn%players === i)
        })
    }
}

fullscreenBtn.addEventListener("click", () => {
  fullscreenBtn.classList.toggle("active");
  toggleFullscreen(gameBlock, fullscreenBtn, true, gameBoundResize)
})

copyLinkBtn.addEventListener("click", () => {
  const currentUrl = new URL(window.location.href);
  currentUrl.search = ""
  const params = currentUrl.searchParams;
  params.set("course", courseSelect.value)
  document.querySelectorAll(".game-filters input:checked:not(.select-all)").forEach(i => params.append(i.classList[0], i.value))
  document.querySelectorAll(".game-options input:checked:not(.select-all)").forEach(i => params.append(i.classList[0], i.value))
  document.querySelectorAll(".game-settings input:checked:not(.select-all)").forEach(i => params.append(i.classList[0], i.value))
  const newUrl = currentUrl.origin + currentUrl.pathname + "?" + params.toString() + currentUrl.hash
  copyToClipboard(newUrl)
  alert("Game link copied to clipboard with current settings.")
})

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}

function pickString(input, randomize = true) {
    if (typeof input === "string") return input;
    if (randomize) return input[Math.floor(Math.random()*input.length)];
    return input[0]
}

function randomize(list) {
    return list.sort(() => Math.random() - 0.5)
}

function imageZoom(url) {
    return `<img draggable="false" class="img" src=${url}><img class="magnify" tabindex="0" src="/icons/magnify.svg">`
}

async function loadJSON(url) {
    return await fetch(url)
    .then(response => response.json())
}
