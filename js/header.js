let openHeaderBtn;
let headerItems;
let headerOpen = false;

document.querySelector("script.header").insertAdjacentHTML("beforebegin", `
  <header class="header-pc">
    <a href="/" title="Home">
      <img src="/svgs/logo.svg" class="header-logo">
    </a>
    <a href="/classes">Classes</a>
    <a href="/about">About</a>
    <a href="/resources">Resources</a>
    <a href="/tools">Tools</a>
  </header>
  <header class="header-mobile">
    <div class="header-top">
      <button class="header-expand">
        <img src="/svgs/expand.svg">
      </button>
      <img src="/svgs/logo.svg" class="header-logo">
    </div>
    <div class="header-items hidden">
      <a href="/home">Home</a>
      <a href="/classes">Classes</a>
      <a href="/about">About</a>
      <a href="/resources">Resources</a>
      <a href="/tools">Tools</a>
    </div>
  </header>
`);

setTimeout(() => {
  updateHeader();
}, 500);

function updateHeader() {
  document.querySelector(".header-expand").addEventListener("click", () => {
    headerOpen = !headerOpen;
    document.querySelector(".header-expand").innerHTML = headerOpen ? `<img src="/svgs/shrink.svg">` : `<img src="/svgs/expand.svg">`;
    document.querySelector(".header-items").classList.toggle("hidden");
  })
}