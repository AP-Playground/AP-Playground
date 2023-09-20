const dropdownButtons = document.getElementsByClassName("dropdown-button");

for (i = 0; i < dropdownButtons.length; i++) {
  dropdownButtons[i].addEventListener("click", (e) => {
    const btn = e.currentTarget;
    btn.classList.toggle("open");
    if (btn.classList.contains("open")) {
      btn.textContent = "⯆"
    } else {
      btn.textContent = "⯈"
    }
  })
}