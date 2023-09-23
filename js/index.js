let page = window.location.search.slice(1);
console.log(page)
if (page === "") window.location.replace("/?home");

const realURL = "/" + mapPage(page.split("/")) + ".html";
document.querySelector("iframe").src = realURL;

function mapPage(pathComps) {
  const length = pathComps.length;
  switch (pathComps[0]) {
    case "home": return "home";
    case "about": return "about";
    case "resources": return "resources";
    case "classes": return "classes";
    case "ap-biology": {
      if (length === 1) return "ap-biology/course-overview";
      if (length === 2 && pathComps[1] === "final-test") return pathComps.join("/");
      if (length === 2) return pathComps.join("/") + "/unit-overview";
      return pathComps.join("/");
    }
  }
}