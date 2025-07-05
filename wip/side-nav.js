const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus") || "open";
if (sideNavStatus === "closed") html.classList.add("side-nav-closed");

requestAnimationFrame(function() {
  document.querySelector(".side-nav-btn").addEventListener("click", () => {
    html.classList.toggle('side-nav-closed');
    sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
    localStorage.setItem('sideNavStatus', sideNavStatus);
  })
  document.documentElement.classList.remove("no-transition")
})