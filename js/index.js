const searchResults = document.querySelectorAll(".search-results a:not(:last-child)");
const lastChild = document.querySelector(".search-results a:last-child");
const searchBar = document.querySelector(".search input");

updateSearchResults()

searchBar.addEventListener("keyup", updateSearchResults)

function updateSearchResults() {
  const typedVal = searchBar.value;
  let lastFound = undefined;

  searchResults.forEach(result => {
    result.classList.remove("last");
    if (result.textContent.replace(" - Unavailable", "").toLowerCase().includes(typedVal.toLowerCase().trim())) {
      result.classList.remove("hidden");
      lastFound = result
    } else result.classList.add("hidden");
  })
  
  if (lastFound) {
    lastFound.classList.add("last");
    lastChild.classList.add("hidden");
  } else lastChild.classList.remove("hidden");
}