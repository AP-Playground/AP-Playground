const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus");
if (!sideNavStatus) {
  sideNavStatus = "open";
  localStorage.setItem("sideNavStatus", sideNavStatus);
}
let currentSideNavScroll = 0;
let sideNavLinks;

if (sideNavStatus === "closed") html.classList.add("side-nav-closed");



const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
let darkModeStatus = localStorage.getItem("darkModeStatus");
if (!darkModeStatus) {
  darkModeStatus = prefersDarkMode ? "dark" : "light";
  localStorage.setItem("darkModeStatus", darkModeStatus);
}

if (darkModeStatus === "dark") html.classList.add("dark-mode");



window.addEventListener("DOMContentLoaded", function() {
  document.documentElement.classList.remove("no-transition");
  if (this.window.innerWidth <= 1200) {
    sideNavStatus = 'closed';
    localStorage.setItem('sideNavStatus', sideNavStatus);
    html.classList.add('side-nav-closed');
  }
  sideNavLinks = document.querySelector(".side-nav-links")
  document.querySelector(".side-nav-btn").addEventListener("click", () => {
    if (sideNavStatus === 'open') {
      currentSideNavScroll = sideNavLinks.scrollTop;
    }
    html.classList.toggle('side-nav-closed');
    sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
    localStorage.setItem('sideNavStatus', sideNavStatus);
    if (sideNavStatus === 'open') {
      sideNavLinks.scrollTo({ top: currentSideNavScroll, behavior: "auto" });
    }
  })

  document.querySelector(".dark-mode-btn").addEventListener("click", () => {
    html.classList.toggle("dark-mode");
    darkModeStatus = darkModeStatus === "dark" ? "light" : "dark";
    localStorage.setItem("darkModeStatus", darkModeStatus);
  });
})