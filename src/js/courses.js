const courseBlocks = Array.from(document.querySelectorAll(".courses-container > .content-block"));
const endBlock = courseBlocks.pop()
let courses = [];
courseBlocks.forEach(course => {
  courses.push(course.querySelector("h2").textContent.slice(0,-1))
})

document.getElementById("course-search").addEventListener("change", (e) => {
  const search = e.target.value;
  let found = false;
  courses.forEach((course, idx) => {
    if (course.contains(search)) {
      courseBlocks[idx].classList.remove("hidden");
      found = true;
    } else {
      courseBlocks[idx].classList.add("hidden")
    }
  })
  if (found) {
    endBlock.classList.add("hidden");
  } else {
    endBlock.classList.remove("hidden")
  }
})