const unitOptions = Array.from(document.querySelectorAll(".unit-option"));
const gameOptions = Array.from(document.querySelectorAll(".game-option"));
const identifierOptions = Array.from(document.querySelectorAll(".identifier-option"));
const sortOptions = Array.from(document.querySelectorAll(".sort-option"));

document.querySelector("#game-options").addEventListener("submit", function (e) {
  if (!unitOptions.some(option => option.checked)) {
    e.preventDefault();
    alert("Please select at least one unit!");
    return;
  }
  if (!gameOptions.some(option => option.checked)) {
    e.preventDefault();
    alert("Please select at least one game!");
    return;
  }
  if (!identifierOptions.some(option => option.checked)) {
    e.preventDefault();
    alert("Please select an identifier!");
    return;
  }
  if (!sortOptions.some(option => option.checked)) {
    e.preventDefault();
    alert("Please select a sort!");
    return;
  }
})

document.querySelector("#title-game").addEventListener("change", function () {
  if (this.checked) {
    identifierOptions[1].checked = false;
    identifierOptions[2].checked = false;
    
    identifierOptions[1].disabled = true;
    identifierOptions[2].disabled = true;
  } else {
    identifierOptions[1].disabled = false;
    identifierOptions[2].disabled = false;
  }
})