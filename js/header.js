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
    <span><a href="/tools">Tools<img class="header-arrow" src="/svgs/toolbar-arrow.svg"></a>
      <div class="header-dropdown">
        <div>
          <a href="/tools/flashcards/">Flashcards</a>
          <a href="/tools/flashcards/">Flashcards12321</a>
          <a href="/tools/flashcards/">Flashcardssd</a>
          <a href="/tools/flashcards/">1233</a>
        </div>
      </div>
    </span>
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