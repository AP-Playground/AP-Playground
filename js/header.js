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
    <div class="header-top hidden">
      <button class="header-expand" onclick="this.parentNode.classList.toggle('hidden');">
      </button>
      <img src="/svgs/logo.svg" class="header-logo">
    </div>
    <div class="header-items">
      <a href="/">Home</a>
      <a href="/classes">Classes</a>
      <a href="/about">About</a>
      <a href="/resources">Resources</a>
      <a href="/tools">Tools</a>
    </div>
  </header>
`);