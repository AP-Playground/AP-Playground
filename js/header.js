const openMenuBtn = document.querySelector("button");
const menuOpen = false;
console.log(openMenuBtn)

openMenuBtn.addEventListener("click", () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    openMenuBtn.innerHTML = '<img src="/shrink.svg">';
  } else {
    openMenuBtn.innerHTML = '<img src="/expand.svg">';
  }
})