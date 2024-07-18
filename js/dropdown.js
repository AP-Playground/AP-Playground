const dropdownHeaders = document.getElementsByClassName("dropdown-header");

for (i = 0; i < dropdownHeaders.length; i++) {
  dropdownHeaders[i].addEventListener("click", (e) => {
    e.currentTarget.parentNode.classList.toggle("open");
  })
}