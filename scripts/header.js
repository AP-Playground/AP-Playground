export function breadcrumbs(...links) {
  let breadcrumbs = `<nav aria-label="Breadcrumb" class="breadcrumbs"><ol>`;
  let length = links.length
  breadcrumbs += links.map(([title, link], idx) => {
    return `<li><a href="${link}"${idx === length - 1 ? 'aria-current="page"' : ""}>${title}</a></li>`
  }).join("")
  breadcrumbs += `</ol></nav>`
  return breadcrumbs;
}