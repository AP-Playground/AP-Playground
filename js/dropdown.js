const dropdownHeaders = document.getElementsByClassName("dropdown-header");

for (i = 0; i < dropdownHeaders.length; i++) {
  dropdownHeaders[i].addEventListener("click", (e) => {
    const header = e.currentTarget;
    header.classList.toggle("open");
    if (header.classList.contains("open")) {
      header.textContent = header.textContent.replace("⯈","⯆");
    } else {
      header.textContent = header.textContent.replace("⯆","⯈");
    }
  })
}