const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus") || "open";

if (sideNavStatus === "closed") html.classList.add("side-nav-closed");

window.addEventListener("DOMContentLoaded", function() {
  requestAnimationFrame(function() {
    document.documentElement.classList.remove("no-transition");
    requestAnimationFrame(function() {
      if (this.window.innerWidth <= 1200) {
        sideNavStatus = 'closed';
        localStorage.setItem('sideNavStatus', sideNavStatus);
        html.classList.remove('side-nav-closed');
      }
    })
  })

  document.querySelector(".side-nav-btn").addEventListener("click", () => {
    html.classList.toggle('side-nav-closed');
    sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
    localStorage.setItem('sideNavStatus', sideNavStatus);
  })
})