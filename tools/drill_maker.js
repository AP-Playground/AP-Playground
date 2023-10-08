const img = document.querySelector("img");
const container = document.querySelector(".container");
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; selected = undefined;

function dragMouseDown(e, elmnt) {
  selected = elmnt;
  elmnt.classList.add("selected");
  e.preventDefault();
  pos3 = e.pageX;
  pos4 = e.pageY;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
  elmnt.parentNode.querySelector(".input").focus();
}

function elementDrag(e) {
  e.preventDefault();
  pos1 = pos3 - e.pageX;
  pos2 = pos4 - e.pageY;
  pos3 = e.pageX;
  pos4 = e.pageY;
  selected.parentNode.style.top = (selected.parentNode.offsetTop - pos2) + "px";
  selected.parentNode.style.left = (selected.parentNode.offsetLeft - pos1) + "px";
}

function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
  selected.classList.remove("selected");
  selected.parentNode.style.top = round(selected.parentNode.style.top.slice(0, -2)) + "px";
  selected.parentNode.style.left = round(selected.parentNode.style.left.slice(0, -2)) + "px";
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
  console.log(elmnt.parentNode)
  container.insertAdjacentElement("beforeend", elmnt.parentNode.cloneNode(true));
}

function rotate(elmnt, pos, rot) {
  elmnt.style.setProperty('--position',parseInt(elmnt.style.getPropertyValue('--position')) + pos)
  elmnt.style.setProperty('--rotation',parseInt(elmnt.style.getPropertyValue('--rotation')) + rot)
}

function round(val) {
  return Math.round(val/5.68)*5.68
}

function exportPage() {
  let exportData = [];
  let temp = [];
  document.querySelectorAll(".dotContainer").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.querySelector(".input").textContent);
    temp.push(elmnt.firstElementChild.style.getPropertyValue("--position"))
    temp.push(elmnt.firstElementChild.style.getPropertyValue("--rotation"))
    exportData.push([...temp]);
    temp.length = 0;
  })
  console.log(JSON.stringify(exportData));
}

function importPage() {
  document.querySelectorAll(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  const data = JSON.parse(document.querySelector(".import-input").value)
  console.log(data)
  data.forEach(elmnt => {
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
}