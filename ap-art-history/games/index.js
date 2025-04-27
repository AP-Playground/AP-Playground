const unitOptions = Array.from(document.querySelectorAll(".unit-option"));
const gameOptions = Array.from(document.querySelectorAll(".game-option"));
const identifierOptions = Array.from(document.querySelectorAll(".identifier-option"));

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
})