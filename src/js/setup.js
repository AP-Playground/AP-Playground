const html = document.documentElement;

let sideNavStatus = localStorage.getItem("sideNavStatus");
if (!sideNavStatus) {
  sideNavStatus = "open";
  localStorage.setItem("sideNavStatus", sideNavStatus);
}
let sideNavLinks = document.querySelector(".side-nav-links");

if (sideNavStatus === "closed") {
  html.classList.add("side-nav-closed")
  sideNavLinks.inert = true;
};


const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
let darkModeStatus = localStorage.getItem("darkModeStatus");
if (!darkModeStatus) {
  darkModeStatus = prefersDarkMode ? "dark" : "light";
  localStorage.setItem("darkModeStatus", darkModeStatus);
}

if (darkModeStatus === "dark") html.classList.add("dark-mode");



requestAnimationFrame(function() {
  document.documentElement.classList.remove("no-transition");
  if (window.innerWidth <= 1200 && sideNavStatus === "open") {
    toggleSideNav();
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
  const accordion = btn.parentElement.parentElement;
  accordion.querySelector(".accordion-content").inert = !accordion.classList.contains("open")

  btn.addEventListener("click", e => {
    accordion.classList.toggle("open");
    accordion.querySelector(".accordion-content").inert = !accordion.classList.contains("open")
  })
})

document.querySelectorAll(".more-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const parent = e.currentTarget.parentElement
    parent.classList.toggle("expanded");
    parent.querySelector(".more-container").inert = !parent.classList.contains("expanded");
    parent.querySelectorAll(".more-container .video-embed.unloaded").forEach(iframe => {
      iframe.src = iframe.dataset.src;
      iframe.classList.remove("unloaded")
    })
  })
})
document.querySelectorAll(".more-container").forEach(more => {
  more.inert = !more.parentElement.classList.contains("expanded");
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

const pageWrapper = document.querySelector(".page-wrapper")
function toggleSideNav() {
  html.classList.toggle('side-nav-closed');
  sideNavStatus = sideNavStatus === 'open' ? 'closed' : 'open';
  localStorage.setItem('sideNavStatus', sideNavStatus);
  sideNavLinks.inert = sideNavStatus === "closed";
  pageWrapper.inert = window.innerWidth <= 1200 && sideNavStatus === "open"
}

window.addEventListener("resize", () => {
  pageWrapper.inert = window.innerWidth <= 1200 && sideNavStatus === "open"
})

const breadcrumbs = document.querySelector('.breadcrumbs');
const breadcrumbItems = Array.from(breadcrumbs.querySelectorAll('.breadcrumbs li:not(.collapsed)')).reverse();
const breadcrumbCollapsed = breadcrumbs.querySelector('.collapsed');
const breadcrumbMeasure = breadcrumbs.querySelector('.breadcrumb-measure');
let breadcrumbExpanded = false;

if (breadcrumbs) {
  window.addEventListener('load', collapseBreadcrumbs);
  const breadcrumbObserver = new ResizeObserver(collapseBreadcrumbs)
  breadcrumbObserver.observe(breadcrumbs)
}

function collapseBreadcrumbs() {
  if (breadcrumbExpanded) return;

  let totalWidth = 11;
  let containerWidth = breadcrumbs.offsetWidth;

  breadcrumbCollapsed.style.display = 'none';

  const breadcrumbCount = breadcrumbItems.length
  breadcrumbItems.forEach((crumb, i) => {
    crumb.style.display = 'inline';

    breadcrumbMeasure.innerHTML = crumb.textContent;
    totalWidth += breadcrumbMeasure.offsetWidth;

    if (i === breadcrumbCount - 1) totalWidth -= 1;
    else totalWidth += 25;

    if (i > 1 && totalWidth > containerWidth) {
      crumb.style.display = 'none';
      breadcrumbCollapsed.style.display = 'inline';
    }
  })
}

breadcrumbCollapsed.addEventListener("click", () => {
  if (breadcrumbExpanded) return;
  breadcrumbExpanded = true;

  breadcrumbCollapsed.style.display = 'none';
  breadcrumbItems.forEach(crumb => crumb.style.display = 'inline');
})