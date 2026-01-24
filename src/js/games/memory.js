const courseSelect = document.querySelector("#course-select")
const gameBlock = document.querySelector(".game-block")
gameBlock.inert = true;

const gameFilters = document.querySelector(".game-filters")
const gameOptions = document.querySelector(".game-options")
const gameSettings = document.querySelector(".game-settings")
const settingData = JSON.parse(gameSettings.innerHTML)
gameSettings.innerHTML = "";

const slug = window.location.pathname.split("/").at(-1).replace(".html", "")

let filters = {};
let options = {};
let settings = {};

let vocab;
let vocabData;
let courseNav;

courseSelect.addEventListener("change", async () => {
    gameBlock.inert = true;
    gameBlock.classList.remove("active");
    gameSettings.hidden = false;
    gameFilters.innerHTML = ""
    gameOptions.innerHTML = ""
    gameSettings.innerHTML = ""
    filters = {};
    options = {};
    settings = {};

    vocab = await loadJSON(`/${courseSelect.value}/vocab.json`);
    vocabData = await loadJSON(`/${courseSelect.value}/vocab-data.json`);
    courseNav = await loadJSON(`/${courseSelect.value}/nav.json`);
    loadOptions();
})

async function loadJSON(url) {
    return await fetch(url)
    .then(response => response.json())
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

    if (multiselect && all) {
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

function checkLoadGame() {
    let ready = true;
    for (const filter in filters) if (filters[filter].length === 0) ready = false;
    for (const option in options) if (options[option].length === 0) ready = false;
    for (const setting in settings) if (settings[setting].length === 0) ready = false;
    if (options.info[0] === options.identifier[0]) ready = false;

    if (ready) {
        loadGame();
        gameBlock.inert = false;
        gameBlock.classList.add("active");
    } else {
        gameBlock.inert = true;
        gameBlock.classList.remove("active")
    }
}

let availableTerms;

function loadGame() {
    loadTerms()
    if (availableTerms.length < Number(settings.size[0])) {
        alert("There are not enough terms available with your selected filters");
        return
    }
    loadBoard()
    fillBoard()
    functionBoard()
    // detect win condition
    // end screen
    requestAnimationFrame(() => {
        document.querySelectorAll(".game-tile.init").forEach(i => i.classList.remove("init"))
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
            if (filter[0] === "select-all") continue;
            if (!filters[filter].some(item => vocab[key][filter].includes(item))) return false;
        }

        if (!vocab[key].hasOwnProperty(options.info[0])) return false;
        if (!vocab[key].hasOwnProperty(options.identifier[0])) return false;

        return true;
    })
}

const gameBound = gameBlock.querySelector(".game-bound")
const game = gameBound.querySelector(".game");
const gameUI = gameBlock.querySelector(".game-ui")
const moduleControls = gameBlock.querySelector(".module-controls");
const fullscreenBtn = moduleControls.querySelector(".fullscreen");

fullscreenBtn.addEventListener("click", () => {
  fullscreenBtn.classList.toggle("active");
  toggleFullscreen(gameBlock, fullscreenBtn)
})

function loadBoard() {
    game.innerHTML = ""
    let tiles = Number(settings.size[0]);
    switch (tiles) {
        case 10: {
            game.style.setProperty("--landscape-columns", 5)
            game.style.setProperty("--portrait-columns", 4)
            gameBound.style.setProperty("--landscape-aspect-ratio", 1.65)
            gameBound.style.setProperty("--portrait-aspect-ratio", 1.05)
            break;
        }
        case 15: {
            game.style.setProperty("--landscape-columns", 6)
            game.style.setProperty("--portrait-columns", 5)
            gameBound.style.setProperty("--landscape-aspect-ratio", 1.6)
            gameBound.style.setProperty("--portrait-aspect-ratio", 1.1)
            break;
        }
        case 21: {
            game.style.setProperty("--landscape-columns", 7)
            game.style.setProperty("--portrait-columns", 6)
            gameBound.style.setProperty("--landscape-aspect-ratio", 1.55)
            gameBound.style.setProperty("--portrait-aspect-ratio", 1.15)
        }
    }
    for (let i = 0; i < tiles * 2; i++) {
        game.insertAdjacentHTML("beforeend", `<button class="game-tile init" data-key="" style="--index:${i}"><div class="front"></div><div class="back"></div></button>`)
    }
}

function fillBoard() {
    const usedTerms = randomize(availableTerms).slice(0,settings.size[0])
    const cards = []
    const data = vocabData.games.memory;
    for (const term of usedTerms) {
        if (data.termImage.includes(options.identifier[0])) {
            cards.push([term, imageZoom(vocab[term][options.identifier[0]])])
        } else cards.push([term, vocab[term][options.identifier[0]]])
        
        if (data.image.includes(options.info[0])) {
            cards.push([term, imageZoom(vocab[term][options.info[0]])])
        } else cards.push([term, vocab[term][options.info[0]]])
    }
    randomize(cards);

    const tile = document.querySelectorAll(".game-tile")
    const tileBack = document.querySelectorAll(".game-tile .back")
    for (const i in cards) {
        tile[i].dataset.key = cards[i][0]
        tileBack[i].innerHTML = cards[i][1]
    }
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

        if (mode === "easy") {
            gameTiles.forEach(tile => flipCard(tile))
        }
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

function randomize(list) {
    return list.sort(() => Math.random() - 0.5)
}

function imageZoom(url) {
    return `<img draggable="false" class="img" src=${url}><img class="magnify" tabindex="0" src="/icons/magnify.svg">`
}

document.querySelector("button.replay").addEventListener("click", () => {
    const tiles = document.querySelectorAll(".game-tile");
    const length = tiles.length;
    tiles.forEach(tile => tile.classList.add("init"))
    tiles.forEach(tile => tile.inert = true)
    tiles.forEach((tile,i) => tile.style.setProperty("--index", length - i - 1))
    setTimeout(() => {
        loadGame()
    }, 25 * tiles.length)
})

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

function handleFlip(tile) {
    let prevSelected = selected;
    if (mode === "easy") {
        tile.classList.add("selected")
        if (!selected) {
            selected = tile;
            return;
        }
        if (selected === tile) {
            tile.classList.remove("selected")
        } else if (selected.dataset.key === tile.dataset.key) {
            tile.inert = true;
            selected.inert = true;
            tile.classList.add("correct")
            selected.classList.add("correct")
            tile.classList.remove("selected")
            selected.classList.remove("selected")
        } else {
            tile.classList.remove("selected")
            selected.classList.remove("selected")
        }
        selected = undefined;
    } else if (mode === "medium") {
        const startedFlipped = tile.classList.contains("flipped");
        if (!tile.classList.contains("flipped")) flipCard(tile);
        tile.classList.add("selected")
        if (!selected) {
            selected = tile;
            return;
        }
        if (selected === tile) {
            tile.classList.remove("selected")
        } else if (selected.dataset.key === tile.dataset.key) {
            tile.inert = true;
            selected.inert = true;
            if (!startedFlipped) {
                setTimeout(() => {
                    tile.classList.add("correct")
                    prevSelected.classList.add("correct")
                    tile.classList.remove("selected")
                    prevSelected.classList.remove("selected")
                }, 1000)
            } else {
                tile.classList.add("correct")
                selected.classList.add("correct")
                tile.classList.remove("selected")
                selected.classList.remove("selected")
            }
        } else {
            tile.classList.remove("selected")
            selected.classList.remove("selected")
        }
        selected = undefined;
    } else if (mode === "hard") {
        flipCard(tile)
        tile.classList.add("selected")
        if (!selected) {
            selected = tile;
            return;
        }
        if (selected === tile) {
            tile.classList.remove("selected")
        } else if (selected.dataset.key === tile.dataset.key) {
            tile.inert = true;
            selected.inert = true;
            setTimeout(() => {
                tile.classList.add("correct")
                prevSelected.classList.add("correct")
                tile.classList.remove("selected")
                prevSelected.classList.remove("selected")
            }, 1000)
        } else {
            tile.inert = true;
            selected.inert = true;
            setTimeout(() => {
                tile.inert = false;
                prevSelected.inert = false;
                flipCard(tile);
                flipCard(prevSelected)
                tile.classList.remove("selected")
                prevSelected.classList.remove("selected")
            }, 1000)
        }
        selected = undefined;
    }
}

const progress = document.querySelector(".progress")
function updateProgress() {
    const correct = document.querySelectorAll(".game-tile.correct").length
    progress.textContent = (correct/2) + "/" + (settings.size[0])
}