const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus");
if (!sideNavStatus) {
  sideNavStatus = "open";
  localStorage.setItem("sideNavStatus", sideNavStatus);
}

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
  document.querySelector(".side-nav-btn").addEventListener("click", () => {
    html.classList.toggle('side-nav-closed');
    sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
    localStorage.setItem('sideNavStatus', sideNavStatus);
  })

  document.querySelector(".dark-mode-btn").addEventListener("click", () => {
    html.classList.toggle("dark-mode");
    darkModeStatus = darkModeStatus === "dark" ? "light" : "dark";
    localStorage.setItem("darkModeStatus", darkModeStatus);
  });
})