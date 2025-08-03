export function breadcrumbs(...links) {
  let breadcrumbs = `<nav aria-label="Breadcrumb" class="breadcrumbs"><ol>`;
  let length = links.length
  breadcrumbs += links.map((title, idx) => {
    return `<li><a href="${"../".repeat(length - idx - 1)}"${idx === length - 1 ? 'aria-current="page"' : ""}>${title}</a></li>`
  }).join("")
  breadcrumbs += `</ol></nav>`
  return breadcrumbs;
}