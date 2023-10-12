const img = query("img");
const container = query(".container");
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; selected = undefined;
let page = 0, pageData = [];
let playing = false;

function dragMouseDown(e, elmnt) {
  pos3 = e.pageX;
  pos4 = e.pageY;
  document.onmouseup = closeDragElement;
  document.onmousemove = elementDrag;
  if (elmnt.classList.contains("dot")) {
    selected = elmnt.parentNode;
    setTimeout(() => {
      selected.querySelector(".input").focus();
    }, 0)
    elmnt.classList.add("selected");
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
  selected.style.top = round(selected.style.top.slice(0, -2)) + "px";
  selected.style.left = round(selected.style.left.slice(0, -2)) + "px";
}

img.addEventListener("dblclick", addNewPoint);

function addNewPoint(e) {
  const top = round(e.pageY);
  const left = round(e.pageX);
  container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${top}px; left: ${left}px;">
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>
        <div class="label" style="--position: -4; --rotation: 0">
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, -1, 0)">⭯</span>
          <span class="input" contenteditable onblur="if(this.textContent === '') this.parentNode.parentNode.remove();"></span>
          <span class="rot" onclick="rotate(this.parentNode, 1, 0)">⭮</span>
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, 1)">⤾</span>
          <span class="not-visible"></span>
        </div>`
);
  container.lastElementChild.querySelector(".input").focus();
}

function duplicate(elmnt) {
  container.insertAdjacentElement("beforeend", elmnt.parentNode.cloneNode(true));
  container.lastElementChild.querySelector(".input").focus();
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
  queryA(".dotContainer").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.querySelector(".input").textContent);
    temp.push(elmnt.lastElementChild.style.getPropertyValue("--position")*1)
    temp.push(elmnt.lastElementChild.style.getPropertyValue("--rotation")*1)
    exportData[0].push([...temp]);
    temp.length = 0;
  })
  queryA(".title").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.textContent);
    exportData[1].push([...temp]);
    temp.length = 0;
  })
  queryA(".text-label").forEach(elmnt => {
    temp.push(elmnt.style.top);
    temp.push(elmnt.style.left);
    temp.push(elmnt.textContent);
    exportData[2].push([...temp]);
    temp.length = 0;
  })
  exportData.push([query("#bpm-input").value*1, query("#move-input").value*1, query("#float-input").checked*1])
  return exportData;
}

function loadPage(data) {
  query("#page-num-display").textContent = "Page " + (page + 1)
  queryA(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".title").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".text-label").forEach(elmnt => {
    elmnt.remove();
  })
  data[0].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${elmnt[0]}; left: ${elmnt[1]};">
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>
        <div class="label" style="--position: ${elmnt[3]}; --rotation: ${elmnt[4]}">
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, -1, 0)">⭯</span>
          <span class="input" contenteditable onblur="if(this.textContent === '') this.parentNode.parentNode.remove();">${elmnt[2]}</span>
          <span class="rot" onclick="rotate(this.parentNode, 1, 0)">⭮</span>
          <span class="not-visible"></span>
          <span class="rot" onclick="rotate(this.parentNode, 0, 1)">⤾</span>
          <span class="not-visible"></span>
        </div>`
  );
  })
  data[1].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
    `<p class="title" style="top: ${elmnt[0]}; left: ${elmnt[1]};" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();">${elmnt[2]}</p>`
    )
  })
  data[2].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
    `<p class="text-label" style="top: ${elmnt[0]}; left: ${elmnt[1]};" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();">${elmnt[2]}</p>`
    )
  })
  query("#bpm-input").value = data[3][0];
  query("#move-input").value = data[3][1];
  if (data[3][2] === 1) {
    query("#float-input").checked = true;
    query("#follow-input").checked = false;
  } else {
    query("#float-input").checked = false;
    query("#follow-input").checked = true;
  }
}

function prevPage() {
  pageData[page] = savePage();
  query("#next").disabled = false;
  page--;
  if (page === 0) query("#prev").disabled = true;
  loadPage(pageData[page]);
}

function nextPage(save = true) {
  if (save) pageData[page] = savePage();
  page++
  if (pageData.length === page + 1) query("#next").disabled = true
  query("#prev").disabled = false;
  loadPage(pageData[page]);
}

function newPage(save = true) {
  pageData[page] = savePage();
  pageData.splice(page, 0, pageData[page])
  nextPage(false);
}

function importPage() {
  pageData = JSON.parse(query(".import-input").value);
  page = 0;
  query(".import-input").value = "";
  query("#next").disabled = pageData.length === 1;
  query("#prev").disabled = true;
  loadPage(pageData[page]);
}

function exportPage() {
  pageData[page] = savePage();
  query("#export-output").textContent = JSON.stringify(pageData);
}

function deletePage() {
  pageData.splice(page, 1);
  page--;
  if (page === -1) {
    page = 0;
    query("#prev").disabled = true;
  };
  if (pageData.length === 1) {
    query("#next").disabled = true;
    query("#prev").disabled = true;
  }
  loadPage(pageData[page]);
}

function addTitle() {
  container.insertAdjacentHTML("beforeend", `
  <p class="title" style="top: 56.8px; left: 56.8px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();"></p>
  `)
  container.lastElementChild.focus();
}

function addLabel() {
  container.insertAdjacentHTML("beforeend", `
  <p class="text-label" style="top: 56.8px; left: 56.8px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();"></p>
  `)
  container.lastElementChild.focus();
}

function query(val) {
  return document.querySelector(val);
}

function queryA(val) {
  return document.querySelectorAll(val);
}

let timeout;

function handlePlay() {
  if (playing) {
    query("#play-btn").textContent = "▶";
    playing = false;
    loadPage(pageData[page]);
    query("#prev").disabled = page === 0;
    query("#next").disabled = pageData.length === page + 1;
    clearTimeout(timeout);
    return;
  }

  pageData[page] = savePage();
  if (page + 1 === pageData.length) return;
  const curPage = pageData[page][0];
  const nextPage = pageData[page + 1][0];
  const pairs = [];
  curPage.forEach(curItem => {
    let pair;
    nextPage.forEach(nextItem => {
      if (curItem[2] === nextItem[2]) {
        pair = nextItem;
      }
    })
    if (pair) {
      pairs.push([curItem[0],curItem[1],pair[0],pair[1]])
    }
  })
  loadAnimation(pairs);
  container.style.setProperty("--duration", 60/pageData[page][3][0]*pageData[page][3][1]);
  timeout = setTimeout(() => {
    handlePlay();
    handlePlay();
  }, 60/pageData[page][3][0]*pageData[page][3][1]*1000 + 200);
  setTimeout(updateAnimation, 1, pairs);
  query("#play-btn").textContent = "⏹";
  playing = true;
  page++;
}

function loadAnimation(pairs) {
  queryA(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".title").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".text-label").forEach(elmnt => {
    elmnt.remove();
  })
  pairs.forEach(pair => {
    container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer animated" style="top: ${pair[0]}; left: ${pair[1]};">
        <div class="dot"></div>`
    );
  });
}

function updateAnimation(pairs) {
  const dots = queryA(".dotContainer");
  pairs.forEach((pair, idx) => {
    dots[idx].style.top = pair[2]
    dots[idx].style.left = pair[3]
  });
}