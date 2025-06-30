document.querySelector('.side-nav-btn').addEventListener('click', () => {
  document.querySelector('body').classList.toggle('side-nav-closed')
});


let currentPage = "ap-biology/unit-2/lesson-9"
let nav = "ap-biology"

let navData;
fetch("/" + nav + "/nav.json").then(response => response.json()).then(
  data => {
    navData = data;
    loadNav()
  }
)

const lessonNavContent = document.querySelector(".lesson-nav > ul");
let temp = "";
function loadNav() {
  let navComponents = currentPage.split("/");
  if (navComponents.length === 1) {
    navData.units.forEach(unit => {
      lessonNavContent.insertAdjacentHTML("beforeend", `
        <a href="" class="item">${unit.prefix}: ${unit.title}</a>
      `)
    })

  } else if (navComponents.length === 2) {
    navData.units.forEach(unit => {
      lessonNavContent.insertAdjacentHTML("beforeend", `
        <a href="" class="item">${unit.prefix}: ${unit.title}</a>
      `)
    })

  } else if (navComponents.length === 3) {
    navData.units.forEach(unit => {
      lessonNavContent.insertAdjacentHTML("beforeend", `
        <a href="" class="item">${unit.prefix}: ${unit.title}</a>
      `)

      if (unit.slug === navComponents[1]) {
        unit.lessons.forEach(lesson => {
          lessonNavContent.insertAdjacentHTML("beforeend", `
            <a ${lesson.slug === navComponents[2]? "": "href=''"} class="sub-item">${lesson.prefix}: ${lesson.title}</a>
        `)})
      }
    })
  }
}



/*    <div>
        <a href="">123</a>
        <a href="">456</a>
        <a href="">789</a>
      </div>


      <div class="accordion lesson-nav">
        <h1 class="accordion-button">Lessons:</h1>
        <hr>
        <div class="accordion-content">
  
        </div>
      </div> */