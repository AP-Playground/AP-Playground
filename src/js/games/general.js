const courseSelect = document.querySelector("#course-select")
const gameBlock = document.querySelector(".game-block")
const gameOverlay = gameBlock.querySelector(".overlay");
gameBlock.inert = true;

const gameFilters = document.querySelector(".game-filters")
const gameOptions = document.querySelector(".game-options")
const gameSettings = document.querySelector(".game-settings")
const settingData = JSON.parse(gameSettings.innerHTML)
gameSettings.innerHTML = "";
gameSettings.hidden = false;

let vocab;
let vocabData;
let courseNav;

let filters = {};
let options = {};
let settings = {};

let firstGameLoad = true;
let initialPageLoad = true;

const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
const gameSlug = window.location.pathname.split("/").at(-1).replace(".html", "");

courseSelect.addEventListener("change", async () => {
    if (!courseSelect.value) {
        gameBlock.inert = true;
        gameBlock.classList.remove("active");
        gameFilters.innerHTML = ""
        gameOptions.innerHTML = ""
        gameSettings.innerHTML = ""
        return;
    }
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
        const totalChecked = [];
        for (const [key, val] of searchParams) {
            if (key === "course") continue;
            const checked = document.querySelector(`.${key}[value="${val}"]`)
            if (checked) {
                checked.checked = true;
                totalChecked.push(checked)
            } else {
                const input = document.querySelector(`input#${key}`)
                if (input) {
                    input.value = val;
                }
            }
        }
        totalChecked.forEach(i => i.dispatchEvent(new Event('change')))
    }
    initialPageLoad = false;
})

if (searchParams.has("course")) {
    courseSelect.value = searchParams.get("course")
    courseSelect.dispatchEvent(new Event('change'));
}


const gameBound = gameBlock.querySelector(".game-bound")
const game = gameBound.querySelector(".game");

// Returns the property with the suffix if it exists, otherwise returns the base property
// This allows different games to get different values from the same key if needed
// This also allows the blocking the use of a key in a certain game, by entering a falsy value into the suffixed key
// Default keys are used for course flashcards
// Case: suffixed key exists -> return suffixed key value (if falsy, game will ignore the key)
// Case: suffixed key doesn't exist -> return base key value (if falsy, game will ignore the key)
function getProperty(object, key, optionalSlug = gameSlug) {
    if (object.hasOwnProperty(optionalSlug + "-" + key)) {
        return object[optionalSlug + "-" + key];
    } else return object[key];
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
}

function pickString(input, randomize = true) {
    if (typeof input === "string") return input;
    if (randomize) return input[Math.floor(Math.random()*input.length)];
    return input[0]
}

function randomize(list) {
    return list.sort(() => Math.random() - 0.5)
}

async function loadJSON(url) {
    return await fetch(url)
    .then(response => response.json())
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

function round(number, decimalPlaces, leadingPlaces = 0) {
  number *= 10 ** decimalPlaces;
  number = Math.round(number)
  number /= (10 ** decimalPlaces)
  if (leadingPlaces) return "0".repeat(Math.max(0, leadingPlaces - wholeDigitCount(number))) + number
  return number
}

function formatTime(milliseconds, forceMinutes = true, forceHours = false) {
  let totalSeconds = Math.ceil(milliseconds / 1000);
  let result = "";
  
  if (forceHours || totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    result += hours + ":";
    totalSeconds %= 3600;
  }

  if (forceMinutes || totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    result += (forceHours ? String(minutes).padStart(2, '0') : minutes) + ":";
    totalSeconds %= 60;
  }

  result += (forceMinutes ? String(totalSeconds).padStart(2, '0') : totalSeconds)

  return result;
}

function wholeDigitCount(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(Math.abs(n))) + 1;
}

const preloads = Array(5)
function preloadImage(url) {
  preloads.shift()
  const img = new Image();
  img.src = url;
  preloads.push(img)
}


const moduleControls = gameBlock.querySelector(".module-controls");
const copyLinkBtn = moduleControls.querySelector(".copy-link");
const fullscreenBtn = moduleControls.querySelector(".fullscreen");

copyLinkBtn.addEventListener("click", () => {
  const currentUrl = new URL(window.location.href);
  currentUrl.search = ""
  const params = currentUrl.searchParams;
  params.set("course", courseSelect.value)
  document.querySelectorAll(".game-filters input:checked:not(.select-all)").forEach(i => {
    params.append(i.classList[0], i.value)
    if (i.value === "input") params.append(i.classList[0]+"-input",i.parentElement.querySelector("div > input").value)
  })
  document.querySelectorAll(".game-options input:checked:not(.select-all)").forEach(i => {
    params.append(i.classList[0], i.value)
    if (i.value === "input") params.append(i.classList[0]+"-input",i.parentElement.querySelector("div > input").value)
  })
  document.querySelectorAll(".game-settings input:checked:not(.select-all)").forEach(i => {
    params.append(i.classList[0], i.value)
    if (i.value === "input") params.append(i.classList[0]+"-input",i.parentElement.querySelector("div > input").value)
  })
  const newUrl = currentUrl.origin + currentUrl.pathname + "?" + params.toString() + currentUrl.hash
  copyToClipboard(newUrl)
  alert("Game link copied to clipboard with current settings.")
})

fullscreenBtn.addEventListener("click", () => {
  fullscreenBtn.classList.toggle("active");
  toggleFullscreen(gameBlock, fullscreenBtn, true, typeof gameboundResize === "function" ? gameBoundResize : undefined)
})