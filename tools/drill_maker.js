const img = query("img");
const container = query(".container");
const overlay = query(".overlay");
const paths = query(".paths");
const importInput = query("#importInput");
const next = query("#next");
const prev = query("#prev");
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; selected = undefined;
let page = 0, pageData = [];
let playing = false;
let offset = 0;
let tool = "p";

pageData[page] = savePage()
updateControls(false, pageData[0])

window.onbeforeprint = () => {
  query("#controls").style.display = "none";
  document.title = query("#pageName").value;
}

window.onafterprint = () => {
  query("#controls").style.display = "inline";
  document.title = "Marching Band Drill Maker | AP-Study";
}

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
  } else {
    selected = elmnt;
  }
  selected.classList.add("selected");
}

function elementDrag(e) {
  e.preventDefault();
  pos1 = pos3 - e.pageX;
  pos2 = pos4 - e.pageY;
  pos3 = e.pageX;
  pos4 = e.pageY;
  selected.style.top = (selected.offsetTop - pos2) + "px";
  selected.style.left = (selected.offsetLeft - pos1) + "px";
  if (selected.classList.contains("pathDot")) updatePath(selected.parentNode);
}

function closeDragElement() {
  document.onmouseup = null;
  document.onmousemove = null;
  selected.style.top = round(selected.style.top.slice(0, -2)) + "px";
  selected.style.left = round(selected.style.left.slice(0, -2)) + "px";
  if (selected.classList.contains("pathDot")) {
    updatePath(selected.parentNode);
  };
  selected.classList.remove("selected");
  selected = undefined;
}

img.addEventListener("dblclick", addNewPoint);

function addNewPoint(e) {
  const top = round(e.pageY);
  const left = round(e.pageX);
  if (tool === "a") {
    if (!query(".pathContainer.active")) return;
    query(".pathContainer.active").insertAdjacentHTML("beforeend", `
    <div class="pathDot" style="top: ${top}px; left: ${left}px" onmousedown="dragMouseDown(event, this)" ondblclick="
    setTimeout(() => {updatePath(query('.pathContainer.active'));}, 0);this.remove();"></div>
    `)
    updatePath(query(".pathContainer.active"));
    return;
  }
  container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer" style="top: ${top}px; left: ${left}px;">
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>
        <div class="label" style="--position: -4; --rotation: 0">
          <span class="rot" onclick="
            if(this.style.textDecoration) this.style.textDecoration='';
            else this.style.textDecoration='line-through';
            this.parentNode.classList.toggle('hidden');
            rotate(this.parentNode, 0, 0);
          ">👁</span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span class="rot" onclick="
            if(this.style.textDecoration) this.style.textDecoration='';
            else this.style.textDecoration='line-through';
            this.parentNode.parentNode.classList.toggle('toAnimate');
            rotate(this.parentNode, 0, 0);
          ">🏃</span>
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
  elmnt.style.setProperty('--position',parseInt(elmnt.style.getPropertyValue('--position')) + pos);
  elmnt.style.setProperty('--rotation',parseInt(elmnt.style.getPropertyValue('--rotation')) + rot);
  elmnt.querySelector(".input").focus();
}

function round(val) {
  return Math.round(val/5.68)*5.68;
}

function savePage() {
  closePath();
  let exportData = [[],[],[],[]];
  let temp = [];
  queryA(".dotContainer").forEach(elmnt => {
    temp.push(parsePX(elmnt.style.top));
    temp.push(parsePX(elmnt.style.left));
    temp.push(elmnt.querySelector(".input").textContent);
    temp.push(elmnt.lastElementChild.style.getPropertyValue("--position")*1);
    temp.push(elmnt.lastElementChild.style.getPropertyValue("--rotation")*1);
    temp.push(elmnt.querySelector(".label").classList.contains("hidden")*1);
    temp.push(elmnt.classList.contains("toAnimate")*1);
    exportData[0].push([...temp]);
    temp.length = 0;
  })
  queryA(".title").forEach(elmnt => {
    temp.push(parsePX(elmnt.style.top));
    temp.push(parsePX(elmnt.style.left));
    temp.push(elmnt.textContent);
    exportData[1].push([...temp]);
    temp.length = 0;
  })
  queryA(".text-label").forEach(elmnt => {
    temp.push(parsePX(elmnt.style.top));
    temp.push(parsePX(elmnt.style.left));
    temp.push(elmnt.textContent);
    exportData[2].push([...temp]);
    temp.length = 0;
  })
  queryA(".pathContainer").forEach(elmnt => {
    temp.push(parseInt(elmnt.getAttribute("equalize")));
    elmnt.querySelectorAll(":not(:first-child)").forEach(pathDot => {
      temp.push([parsePX(pathDot.style.top),parsePX(pathDot.style.left)])
    })
    exportData[3].push([...temp]);
    temp.length = 0;
  })
  exportData.push([query("#pageName").value, query("#bpmInput").value*1, query("#holdInput").value*1, query("#moveInput").value*1])
  return exportData;
}

function loadPage(data) {
  queryA(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".title").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".text-label").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".pathContainer").forEach(elmnt => {
    elmnt.remove();
  })
  data[0].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
      `<div class="dotContainer${elmnt[6] ? " toAnimate" : ""}" style="top: ${elmnt[0]}px; left: ${elmnt[1]}px;">
        <div class="dot" onmousedown="dragMouseDown(event, this)" ondblclick="duplicate(this);"></div>
        <div class="label${elmnt[5] ? " hidden" : ""}" style="--position: ${elmnt[3]}; --rotation: ${elmnt[4]}">
          <span class="rot" onclick="
            if(this.style.textDecoration) this.style.textDecoration='';
            else this.style.textDecoration='line-through';
            this.parentNode.classList.toggle('hidden');
            rotate(this.parentNode, 0, 0);
          " style="text-decoration: ${elmnt[5] ? "line-through" : ""}">👁</span>
          <span class="rot" onclick="rotate(this.parentNode, 0, -1)">⤺</span>
          <span class="rot" onclick="
            if(this.style.textDecoration) this.style.textDecoration='';
            else this.style.textDecoration='line-through';
            this.parentNode.parentNode.classList.toggle('toAnimate');
            rotate(this.parentNode, 0, 0);
          " style="text-decoration: ${elmnt[6] ? "line-through" : ""}">🏃</span>
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
    `<p class="title" style="top: ${elmnt[0]}px; left: ${elmnt[1]}px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();">${elmnt[2]}</p>`
    )
  })
  data[2].forEach(elmnt => {
    container.insertAdjacentHTML("beforeend",
    `<p class="text-label" style="top: ${elmnt[0]}px; left: ${elmnt[1]}px;" onmousedown="dragMouseDown(event, this)" contenteditable onblur="if(this.textContent === '') this.remove();">${elmnt[2]}</p>`
    )
  })
  data[3].forEach(elmnt => {
    paths.insertAdjacentHTML("beforeend", `
    <div class="pathContainer">
      <svg>
        <polyline points="">
      </svg>
    </div>
    `)
    elmnt.forEach((pathDot, idx) => {
      if (idx === 0) {
        query(".pathContainer:last-child").setAttribute("equalize", pathDot);
        return;
      }
      query(".pathContainer:last-child").insertAdjacentHTML("beforeend", `
      <div class="pathDot" style="top: ${pathDot[0]}px; left: ${pathDot[1]}px" onmousedown="dragMouseDown(event, this)"></div>
      `)
      updatePath(query(".pathContainer:last-child"));
    })
  })
  updateControls(false, data);
  selectPath("path1");
}

function prevPage() {
  pageData[page] = savePage();
  page--;
  loadPage(pageData[page]);
}

function nextPage(save = true) {
  if (save) pageData[page] = savePage();
  page++
  loadPage(pageData[page]);
}

function newPage() {
  pageData[page] = savePage();
  pageData.splice(page, 0, pageData[page])
  nextPage(false);
  query("#pageName").value = "Page" + pageData.length;
}

function importPage() {
  const data = JSON.parse(importInput.value)
  if (query("#exportType").value === "doc") {
    pageData = updateData(data[1], data[0]);
    page = 0;
  } else {
    pageData.splice(page + 1, 0, updateData(data[1], data[0], true));
    page++;
  }
  importInput.value = "";
  loadPage(pageData[page]);
  changeTools("page");
}

function exportPage() {
  pageData[page] = savePage();
  if (query("#exportType").value === "doc") {
    query("#export-output").textContent = JSON.stringify([7,pageData]);
  } else {
    query("#export-output").textContent = JSON.stringify([7,pageData[page]]);
  }
}

function deletePage() {
  pageData.splice(page, 1);
  page--;
  if (page === -1) {
    page = 0;
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
    page--;
    loadPage(pageData[page]);
    clearTimeout(timeout);
    return;
  }

  if (page + 1 === pageData.length) return;
  pageData[page] = savePage();
  loadVisibility("normal");
  query("#play-btn").textContent = "⏹";
  playing = true;
  animate();
}

function startAnimation(paths, holdTime, moveTime) {
  queryA(".dotContainer").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".title").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".text-label").forEach(elmnt => {
    elmnt.remove();
  })
  queryA(".pathContainer").forEach(elmnt => {
    elmnt.remove();
  })
  
  const curPage = pageData[page][0];
  const nextPage = pageData[page + 1][0];
  curPage.forEach(curDot => {
    if (curDot[6] === 1) return;
    const nextDot = nextPage.find(nextItem => nextItem[6] === 0 && curDot[2] === nextItem[2]);
    if (nextDot) {
      container.insertAdjacentHTML("beforeend",
        `<div class="dotContainer animated" style="top: ${nextDot[0]}px; left: ${nextDot[1]}px;"><div class="dot"></div>`
      );

      const dot = container.lastElementChild;
      let startIdx = -1;
      let endIdx = -1;
      
      const path = paths.find(tempPath => {
        startIdx = tempPath.findIndex((pathDot, idx) =>
          idx !== 0 && curDot[0] === pathDot[0] && curDot[1] === pathDot[1]
        );
        if (startIdx !== -1) {
          endIdx = tempPath.findLastIndex((pathDot, idx) =>
            idx > startIdx && nextDot[0] === pathDot[0] && nextDot[1] === pathDot[1]
          );
        }
        return endIdx !== -1;
      })

      const animation = [
        {translate: `${curDot[1] - nextDot[1]}px ${curDot[0] - nextDot[0]}px`},
        {translate: `${curDot[1] - nextDot[1]}px ${curDot[0] - nextDot[0]}px`,
        offset: holdTime / (holdTime + moveTime)}
      ]

      if (startIdx !== -1 && endIdx !== -1) {
        let curOffset = holdTime / (holdTime + moveTime);
        let totalLength = 0;
        for (let i = startIdx; i < endIdx; i++) {
          totalLength += dist(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
        }
        for (let i = startIdx + 1; i < endIdx; i++) {
          if (path[0] === 1) {
            curOffset += moveTime/(holdTime + moveTime)*dist(path[i][0], path[i][1], path[i - 1][0], path[i - 1][1])/totalLength;
          } else {
            curOffset += moveTime/(holdTime + moveTime)/(endIdx-startIdx)
          }
          animation.push({
            translate: `${path[i][1] - nextDot[1]}px ${path[i][0] - nextDot[0]}px`,
            offset: curOffset
          })
        }
      }
      
      animation.push({translate: '0 0'});
      dot.animate(animation, holdTime + moveTime)
    }
  })
}

function animate() {
  if (page + 1 === pageData.length) {
    query("#play-btn").textContent = "▶";
    playing = false;
    loadPage(pageData[page]);
    return;
  }
  updateControls(true, pageData[page]);
  const holdTime = 60/pageData[page][4][1]*pageData[page][4][2]*1000;
  const moveTime = 60/pageData[page][4][1]*pageData[page][4][3]*1000;
  startAnimation(pageData[page][3], holdTime, moveTime);
  timeout = setTimeout(animate, holdTime + moveTime);
  page++;
}

function updateData(data, version, pageOnly = false) {
  if (pageOnly) {
    switch(version) {
      case 0: {
        data[3] = [data[3][0], 0, data[3][1]]
      }
      case 1: {
        data[0].forEach((dot, dotIdx) => {
          data[0][dotIdx] = [parsePX(dot[0]), parsePX(dot[1]), dot[2], dot[3], dot[4]];
        })
        data[1].forEach((dot, dotIdx) => {
          data[1][dotIdx] = [parsePX(title[0]), parsePX(title[1]), title[2]];
        })
        data[2].forEach((dot, dotIdx) => {
          data[2][dotIdx] = [parsePX(label[0]), parsePX(label[1]), label[2]];
        })
      }
      case 2: {
        data.push(data[3]);
        data[3] = [];
      }
      case 3: {
        data[4].unshift(`Page ${page + 1}`);
      }
      case 4: {
        data[3].forEach((path) => {path.unshift(0)});
      }
      case 5: {
        data[0].forEach((dot, dotIdx) => {
          data[0][dotIdx].push(0)
        })
      }
      case 6: {
        data[0].forEach((dot, dotIdx) => {
          data[0][dotIdx].push(0)
        })
      }
    }
  } else {
    switch(version) {
      case 0: {
        data.forEach((page, idx) => {
          data[idx][3] = [page[3][0],0,page[3][1]]
        })
      }
      case 1: {
        data.forEach((page, idx) => {
          page[0].forEach((dot, dotIdx) => {
            data[idx][0][dotIdx] = [parsePX(dot[0]), parsePX(dot[1]), dot[2], dot[3], dot[4]]
          })
          page[1].forEach((title, titleIdx) => {
            data[idx][1][titleIdx] = [parsePX(title[0]), parsePX(title[1]), title[2]]
          })
          page[2].forEach((label, labelIdx) => {
            data[idx][2][labelIdx] = [parsePX(label[0]), parsePX(label[1]), label[2]]
          })
        })
      }
      case 2: {
        data.forEach((page, idx) => {
          data[idx].push(page[3]);
          data[idx][3] = [];
        })
      }
      case 3: {
        data.forEach((page, idx) => {
          data[idx][4].unshift(`Page ${idx + 1}`)
        })
      }
      case 4: {
        data.forEach((page, idx) => {
          page[3].forEach((path, pathIdx) => {
            data[idx][3][pathIdx].unshift(0);
          })
        })
      }
      case 5: {
        data.forEach((page, idx) => {
          page[0].forEach((dot, dotIdx) => {
            data[idx][0][dotIdx].push(0)
          })
        })
      }
      case 6: {
        data.forEach((page, idx) => {
          page[0].forEach((dot, dotIdx) => {
            data[idx][0][dotIdx].push(0)
          })
        })
      }
    }
  }
  return data;
}

function loadVisibility(status) {
  queryA(".over-dotContainer").forEach(item => {
    item.remove();
  })
  switch (status) {
    case "normal": {
      return;
    }

    case "prev": {
      if (page === 0) return;
      pageData[page - 1][0].forEach(elmnt => {
        overlay.insertAdjacentHTML("beforeend",
          `<div class="over-dotContainer" style="top: ${elmnt[0]}px; left: ${(elmnt[1] + parseFloat(offset)*5.68)}px;">
            <div class="over-dot"></div>
            ${elmnt[5] ? "" : `<div class="over-label" style="--position: ${elmnt[3]}; --rotation: ${elmnt[4]}">${elmnt[2]}</div>`}`
        );
      })
      return;
    }

    case "next": {
      if (page + 1 === pageData.length) return;
      pageData[page + 1][0].forEach(elmnt => {
        overlay.insertAdjacentHTML("beforeend",
          `<div class="over-dotContainer" style="top: ${elmnt[0]}px; left: ${(elmnt[1] + parseFloat(offset)*5.68)}px;">
            <div class="over-dot"></div>
            ${elmnt[5] ? "" : `<div class="over-label" style="--position: ${elmnt[3]}; --rotation: ${elmnt[4]}">${elmnt[2]}</div>`}`
        );
      })
      return;
    }
  }
}

function parsePX(px) {
  return parseFloat(px.replace("px", ""))
}

function changeTools(newTool) {
  pageData[page] = savePage();
  query("#toolbar").value = newTool;
  tool = newTool[0];
  closePath();
  if (newTool === "page") {
    query("#page-tools").style.display = "inline";
    query("#anim-tools").style.display = "none";
    paths.style.display = "none";
    container.style.pointerEvents = "inherit";
  } else {
    query("#anim-tools").style.display = "inline";
    query("#page-tools").style.display = "none";
    paths.style.display = "inline";
    container.style.pointerEvents = "none";
  }
  selectPath("path1");
  updateControls(false, pageData[page]);
}

function addPath() {
  if (query(".pathContainer.active")) {
    closePath();
  }
  paths.insertAdjacentHTML("beforeend", `
  <div class="pathContainer active"></div>
  `)
  query(".pathContainer.active").insertAdjacentHTML("beforeend", `
  <svg>
    <polyline points="">
  </svg>
  `)
  updateControls(false, pageData[page]);
  query("#equalizeSelect").checked = false;
  query("#pathSelect").value = "path" + (query(".paths").children.length);
}

function closePath() {
  query("#pathSelect").value = "";
  if (query(".pathContainer.active")) {
    if (query(".pathContainer.active").children.length === 1) {
      query(".pathContainer.active").remove();
    } else {
      query(".pathContainer.active").setAttribute("equalize",
        query("#equalizeSelect").checked*1);
      query(".pathContainer.active").classList.remove("active");
    }
  }
}

function deletePath() {
  query(".pathContainer.active").remove();
  const currentPath = query("#pathSelect").value;
  selectPath("path" + (Number.parseInt(currentPath.replace("path", "")) - 1));
}

function updatePath(path) {
  const svgPath = path.querySelector("polyline")
  let tempPath = "";
  path.querySelectorAll(".pathDot").forEach(dot => {
    tempPath += `${parsePX(dot.style.left)},${parsePX(dot.style.top)} `
  })
  svgPath.setAttribute("points", tempPath);
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function updateControls(disabled, curPage) {
  if (disabled) {
    query("#visibility").value = "normal";
    next.disabled = true;
    prev.disabled = true;
    queryA(".disableable").forEach(input => {input.disabled = true});
  } else {
    next.disabled = (page + 1) === pageData.length;
    prev.disabled = page === 0;
    queryA(".disableable").forEach(input => {input.disabled = false});

    queryA("#pathSelect option").forEach(elmnt => {elmnt.remove()})
    for (let i = 1; i <= queryA(".pathContainer").length; i++) {
      query("#pathSelect").insertAdjacentHTML("beforeend", `
        <option value="path${i}">Path ${i}</option>
      `);
    }
    queryA(".disableable.pathControl").forEach(input => {input.disabled = !query(".pathContainer.active")});
  }
  query("#play-btn").disabled = page === pageData.length - 1;
  loadVisibility(query("#visibility").value);
  query("#pageName").value = curPage[4][0];
  query("#bpmInput").value = curPage[4][1];
  query("#holdInput").value = curPage[4][2];
  query("#moveInput").value = curPage[4][3];
}

function selectPath(val) {
  let pathNum = Number.parseInt(val.replace("path", ""));
  closePath();
  if (pathNum === 0 && query(".paths").children.length > 0) {
    pathNum = 1;
    val = "path1"
  };
  if (query(".paths").children.length >= pathNum && pathNum !== 0) {
    query(".paths").children[pathNum - 1].classList.add("active");
    query("#equalizeSelect").checked = query(".pathContainer.active").getAttribute("equalize") === "1";
  }
  updateControls(false, pageData[page]);
  query("#pathSelect").value = val;
}