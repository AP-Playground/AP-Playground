const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus") || "open";

if (sideNavStatus === "closed") html.classList.add("side-nav-closed");

window.addEventListener("load", function() {
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
})