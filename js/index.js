let page = window.location.search.slice(1);
if (page === "") window.location.replace("/?home");

const realURL = "/" + mapPage(page.split("/")) + ".html";
const iframe = document.querySelector("iframe");
iframe.src = realURL;
iframe.addEventListener("load", () => {
  document.title = iframe.contentDocument.title;
})

function mapPage(pathComps) {
  const length = pathComps.length;
  switch (pathComps[0]) {
    case "home": return "home";
    case "about": return "about";
    case "resources": return "resources";
    case "classes": return "classes";
    case "tools": return "tools";
    default: {
      if (length === 1) return pathComps[0] + "/course-overview";
      if (length === 2 && pathComps[1] === "final-test") return pathComps.join("/");
      if (length === 2) return pathComps.join("/") + "/unit-overview";
      return pathComps.join("/");
    }
  }
}