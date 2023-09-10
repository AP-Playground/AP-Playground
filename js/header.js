const openMenuBtn = document.querySelector(".header-expand");
const menuItems = document.querySelector(".header-items")
let menuOpen = false;

openMenuBtn.addEventListener("click", () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    openMenuBtn.innerHTML = '<img src="/shrink.svg">';
    menuItems.classList.remove("hidden");
  } else {
    openMenuBtn.innerHTML = '<img src="/expand.svg">';
    menuItems.classList.add("hidden");
  }
})