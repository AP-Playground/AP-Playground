const img = document.querySelector("img");
const container = document.querySelector(".container");
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; selected = undefined;
let page = 0, pageData = [];

function dragMouseDown(e, elmnt) {
  pos3 = e.pageX;
  pos4 = e.pageY;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
  if (elmnt.classList.contains("dot")) {
    elmnt.parentNode.querySelector(".input").focus();
    elmnt.classList.add("selected");
    selected = elmnt.parentNode;
  } else {
    selected = elmnt;
  }
}

function elementDrag(e) {
  e.preventDefault();
  pos1 = pos3 - e.pageX;
  pos2 = pos4 - e.pageY;
  pos3 = e.pageX;
  pos4 = e.pageY;
  selected.style.top = (selected.offsetTop - pos2) + "px";
  selected.style.left = (selected.offsetLeft - pos1) + "px";
}

function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
  if (selected.tagName !== "P") {
    selected.querySelector(".dot").classList.remove("selected");
  }
  selected.style.top = round(selected.style.top.slice(0, -2)/2)*2 + "px";
  selected.style.left = round(selected.style.left.slice(0, -2)/2)*2 + "px";
}

img.addEventListener("dblclick", addNewPoint);

function addNewPoint(e) {
  const top = round(e.pageY);
  const left = round(e.pageX);
  container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${top}px; left: ${left}px;">
        <div class="label" style="--position: -4; --rotation: 0">
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, -1, 0)">⭯</span>
          <span class="input" contenteditable onblur="if(this.textContent.trim() === '') this.parentNode.parentNode.remove();"></span>
          <span class="rot" onclick="rotate(this.parentNode, 1, 0)">⭮</span>
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, 1)">⤾</span>
          <span></span>
        </div>
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>`
);
  container.lastElementChild.querySelector(".input").focus();
}

function duplicate(elmnt) {
  container.insertAdjacentElement("beforeend", elmnt.parentNode.cloneNode(true));
}

function rotate(elmnt, pos, rot) {
  elmnt.style.setProperty('--position',parseInt(elmnt.style.getPropertyValue('--position')) + pos)
  elmnt.style.setProperty('--rotation',parseInt(elmnt.style.getPropertyValue('--rotation')) + rot)
}

function round(val) {
  return Math.round(val/5.68)*5.68
}

function savePage() {
  let exportData = [[],[],[]];
  let temp = [];
  document.querySelectorAll(".dotContainer").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.querySelector(".input").textContent);
    temp.push(elmnt.firstElementChild.style.getPropertyValue("--position"))
    temp.push(elmnt.firstElementChild.style.getPropertyValue("--rotation"))
    exportData[0].push([...temp]);
    temp.length = 0;
  })
  document.querySelectorAll(".title").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.textContent);
    exportData[1].push([...temp]);
    temp.length = 0;
  })
  document.querySelectorAll(".text-label").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.textContent);
    exportData[2].push([...temp]);
    temp.length = 0;
  })
  return exportData;
}

function loadPage(data) {
  document.querySelector("#page-num-display").textContent = "Page " + (page + 1)
  document.querySelectorAll(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  document.querySelectorAll(".title").forEach(elmnt => {
    elmnt.remove();
  })
  document.querySelectorAll(".text-label").forEach(elmnt => {
    elmnt.remove();
  })
  data[0].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${elmnt[0]}; left: ${elmnt[1]};">
        <div class="label" style="--position: ${elmnt[3]}; --rotation: ${elmnt[4]}">
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, -1, 0)">⭯</span>
          <span class="input" contenteditable onblur="if(this.textContent.trim() === '') this.parentNode.parentNode.remove();">${elmnt[2]}</span>
          <span class="rot" onclick="rotate(this.parentNode, 1, 0)">⭮</span>
          <span></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, 1)">⤾</span>
          <span></span>
        </div>
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>`
  );
  })
  data[1].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
    `<p class="title" style="top: ${elmnt[0]}; left: ${elmnt[1]};" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent.trim() === '') this.remove();">${elmnt[2]}</p>`
    )
  })
  data[2].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
    `<p class="text-label" style="top: ${elmnt[0]}; left: ${elmnt[1]};" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent.trim() === '') this.remove();">${elmnt[2]}</p>`
    )
  })
}

function prevPage() {
  pageData[page] = savePage();
  document.querySelector("#next").disabled = false;
  page--;
  if (page === 0) document.querySelector("#prev").disabled = true;
  loadPage(pageData[page]);
}

function nextPage(save = true) {
  if (save) pageData[page] = savePage();
  page++
  if (pageData.length === page + 1) document.querySelector("#next").disabled = true
  document.querySelector("#prev").disabled = false;
  loadPage(pageData[page]);
}

function newPage(save = true) {
  pageData[page] = savePage();
  pageData.splice(page, 0, pageData[page])
  nextPage(false);
}

function importPage() {
  pageData = JSON.parse(document.querySelector(".import-input").value);
  page = 0;
  document.querySelector(".import-input").value = "";
  document.querySelector("#next").disabled = pageData.length === 1;
  document.querySelector("#prev").disabled = true;
  loadPage(pageData[page]);
}

function exportPage() {
  pageData[page] = savePage();
  document.querySelector("#export-output").textContent = JSON.stringify(pageData);
}

function deletePage() {
  pageData.splice(page, 1);
  page--;
  if (page === -1) {
    page = 0;
    document.querySelector("#prev").disabled = true;
  };
  if (pageData.length === 1) {
    document.querySelector("#next").disabled = true;
    document.querySelector("#prev").disabled = true;
  }
  loadPage(pageData[page]);
}

function addTitle() {
  container.insertAdjacentHTML("beforeend", `
  <p class="title" style="top: 56.8px; left: 56.8px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent.trim() === '') this.remove();"></p>
  `)
  container.lastElementChild.focus();
}

function addLabel() {
  container.insertAdjacentHTML("beforeend", `
  <p class="text-label" style="top: 56.8px; left: 56.8px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent.trim() === '') this.remove();"></p>
  `)
  container.lastElementChild.focus();
}