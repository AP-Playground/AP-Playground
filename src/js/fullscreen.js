const fullscreenPlaceholder = document.createElement("div");
let fullscreened = false;
function toggleFullscreen(block, btn) {
  fullscreened = !fullscreened;

  block.ontransitionend = (e) => {
    if (e.target === block && e.propertyName === "left") fullscreenTransition(block, btn)
  };

  const styles = block.style;
  if (fullscreened) {
    styles.zIndex = 1;
    const {top, left, width, height} = block.getBoundingClientRect();
    styles.top = top + "px";
    styles.left = left + "px";
    styles.width = width + "px";
    styles.height = height + "px";

    block.classList.add("fullscreen")
    fullscreenPlaceholder.style.height = height + "px";
    block.insertAdjacentElement("beforebegin", fullscreenPlaceholder);

    requestAnimationFrame(() => {
      styles.top = ""
      styles.left = ""
      styles.width = "";
      styles.height = "";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = i !== block})

  } else {
    if (fullscreenPlaceholder.offsetTop < pageWrapper.scrollTop) pageWrapper.scrollTop = fullscreenPlaceholder.offsetTop;
    fullscreenPlaceholder.style.display = "none";
    styles.transition = "none";
    block.classList.remove("fullscreen")
    const {top, left, width, height} = block.getBoundingClientRect();

    fullscreenPlaceholder.style.height = height + "px";
    fullscreenPlaceholder.style.display = "";
    block.classList.add("fullscreen")

    requestAnimationFrame(() => {
      styles.transition = "all 0.3s ease-in-out";
      styles.position = "absolute";
      block.classList.remove("fullscreen")
      styles.top = top + "px";
      styles.left = left + "px";
      styles.width = width + "px";
      styles.height = height + "px";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = false})
  }
}

function fullscreenTransition(block, btn) {
  pageWrapper.inert = false;
  if(btn && document.activeElement === document.body) btn.focus()
  if (fullscreened) {
    block.style.transition = "left 0.3s ease-in-out, width 0.3s ease-in-out, padding 0.3s ease-in-out";
  } else {
    fullscreenPlaceholder.remove();

    block.style.transition = ""
    block.style.position = "";
    block.style.top = "";
    block.style.left = "";
    block.style.width = "";
    block.style.height = "";
    block.style.zIndex = "";
  }
}