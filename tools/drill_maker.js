const img = document.querySelector("img");
const container = document.querySelector(".container");
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; selected = undefined;

function dragMouseDown(e, elmnt) {
  selected = elmnt;
  elmnt.classList.add("selected");
  e.preventDefault();
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
  elmnt.parentNode.querySelector(".input").focus();
}

function elementDrag(e) {
  e.preventDefault();
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;
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
  const top = round(e.clientY);
  const left = round(e.clientX);
  container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${top}px; left: ${left}px;">
      <div class="label" style="--position: -4; --rotation: 0">
        <span class="rot" onclick="this.parentNode.style.setProperty('--position',parseInt(this.parentNode.style.getPropertyValue('--position')) - 1)">⭯</span><span class="input" contenteditable onblur="if(this.textContent.trim() === '') this.parentNode.parentNode.remove();"></span><span class="rot" onclick="this.parentNode.style.setProperty('--position',parseInt(this.parentNode.style.getPropertyValue('--position')) + 1)">⭮</span>
      </div>
      <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>
    </div>`
);
  container.lastElementChild.querySelector(".input").focus();
}

function duplicate(elmnt) {
  console.log(elmnt.parentNode)
  container.insertAdjacentElement("beforeend", elmnt.parentNode.cloneNode(true));
}

function round(val) {
  return Math.round(val/5.68)*5.68
}