const openHeaderBtn = document.querySelector(".header-expand");
const headerItems = document.querySelector(".header-items")
let headerOpen = false;

openHeaderBtn.addEventListener("click", () => {
  headerOpen = !headerOpen;
  if (headerOpen) {
    openHeaderBtn.innerHTML = '<img src="/shrink.svg">';
    headerItems.classList.remove("hidden");
  } else {
    openHeaderBtn.innerHTML = '<img src="/expand.svg">';
    headerItems.classList.add("hidden");
  }
})