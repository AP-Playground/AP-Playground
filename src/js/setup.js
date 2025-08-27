const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus");
if (!sideNavStatus) {
  sideNavStatus = "open";
  localStorage.setItem("sideNavStatus", sideNavStatus);
}
let currentSideNavScroll = 0;
let sideNavLinks = document.querySelector(".side-nav-links");

if (sideNavStatus === "closed") html.classList.add("side-nav-closed");



const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
let darkModeStatus = localStorage.getItem("darkModeStatus");
if (!darkModeStatus) {
  darkModeStatus = prefersDarkMode ? "dark" : "light";
  localStorage.setItem("darkModeStatus", darkModeStatus);
}

if (darkModeStatus === "dark") html.classList.add("dark-mode");



requestAnimationFrame(function() {
  document.documentElement.classList.remove("no-transition");
  if (this.window.innerWidth <= 1200) {
    sideNavStatus = 'closed';
    localStorage.setItem('sideNavStatus', sideNavStatus);
    html.classList.add('side-nav-closed');
  }
  document.querySelector(".side-nav-btn").addEventListener("click", toggleSideNav)
  document.querySelector(".side-nav-background").addEventListener("click", toggleSideNav)

  document.querySelector(".dark-mode-btn").addEventListener("click", () => {
    html.classList.toggle("dark-mode");
    darkModeStatus = darkModeStatus === "dark" ? "light" : "dark";
    localStorage.setItem("darkModeStatus", darkModeStatus);
  });
})

document.querySelectorAll(".accordion-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.currentTarget.parentElement.parentElement.classList.toggle("open");
  })
})

document.querySelectorAll(".more-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const parent = e.currentTarget.parentElement
    parent.classList.toggle("expanded");
    parent.querySelectorAll(".more-container .video-embed.unloaded").forEach(iframe => {
      iframe.src = iframe.dataset.src;
      iframe.classList.remove("unloaded")
    })
  })
})

  
const imgEnlargedContainer = document.querySelector(".img-enlarged-container");
const imgEnlarged = document.querySelector(".img-enlarged-container > img");

if (imgEnlargedContainer) {
  imgEnlarged.addEventListener("load", e => {
    imgEnlargedContainer.classList.add("active")
  })

  imgEnlargedContainer.addEventListener("click", e => {
    imgEnlargedContainer.classList.remove("active")
  })
}


function toggleSideNav() {
  if (sideNavStatus === 'open') {
    currentSideNavScroll = sideNavLinks.scrollTop;
  }
  html.classList.toggle('side-nav-closed');
  sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
  localStorage.setItem('sideNavStatus', sideNavStatus);
  if (sideNavStatus === 'open') {
    sideNavLinks.scrollTo({ top: currentSideNavScroll, behavior: "auto" });
  }
}

let prevBreadcrumbsScroll;
addEventListener("DOMContentLoaded", () => {
  const breadcrumbs = document.querySelector(".breadcrumbs");
  if (breadcrumbs) {
    prevBreadcrumbsScroll = breadcrumbs.scrollWidth - breadcrumbs.clientWidth
    breadcrumbs.scrollLeft = prevBreadcrumbsScroll;
    addEventListener("resize", () => {
      const curBreadcrumbsScroll = breadcrumbs.scrollWidth - breadcrumbs.clientWidth
      if (prevBreadcrumbsScroll < curBreadcrumbsScroll) {
        breadcrumbs.scrollLeft += curBreadcrumbsScroll - prevBreadcrumbsScroll;
      }
      prevBreadcrumbsScroll = curBreadcrumbsScroll;
    })
  }
})