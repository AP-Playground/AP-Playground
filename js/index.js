const searchResults = document.querySelectorAll(".search-results a");
const searchBar = document.querySelector("main input");

updateSearchResults()

searchBar.addEventListener("keyup", updateSearchResults)

function updateSearchResults() {
  const typedVal = searchBar.value;
  let amountSorted = 0;
  searchResults.forEach(result => {
    if (result.textContent.toLowerCase().includes(typedVal.toLowerCase().trim())) {
      amountSorted++;
      if (amountSorted < 9) {
        result.classList.remove("hidden");
      } else {
        result.classList.add("hidden");
      }
    } else result.classList.add("hidden");
  })
}