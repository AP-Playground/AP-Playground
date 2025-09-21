const listBlocks = Array.from(document.querySelectorAll(".list-container > .content-block"));
const endBlock = listBlocks.pop()
let listTerms = [];
listBlocks.forEach(block => {
  listTerms.push(block.querySelector("h2").textContent.slice(0,-1).toLowerCase().replace("®",""))
})

document.getElementById("list-search").addEventListener("input", (e) => {
  const search = e.target.value;
  let found = false;
  listTerms.forEach((term, idx) => {
    if (term.includes(search.toLowerCase().trim().replace("®",""))) {
      listBlocks[idx].classList.remove("hidden");
      found = true;
    } else {
      listBlocks[idx].classList.add("hidden")
    }
  })
  if (found) {
    endBlock.classList.add("hidden");
  } else {
    endBlock.classList.remove("hidden")
  }
})