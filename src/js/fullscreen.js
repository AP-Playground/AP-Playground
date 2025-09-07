let fullscreenPlaceholder;
let fullscreened = false;
function toggleFullscreen(block, btn) {
  fullscreened = !fullscreened;

  block.ontransitionend = (e) => {
    if (e.target === block && e.propertyName === "left") fullscreenTransition(block, btn)
  };

  const styles = block.style;
  if (fullscreened) {
    fullscreenPlaceholder = block.cloneNode(true);
    styles.zIndex = 1;
    const {top, left, width, height} = block.getBoundingClientRect();
    styles.top = top + "px";
    styles.left = left + "px";
    styles.width = width + "px";
    styles.height = height + "px";

    block.classList.add("fullscreen")
    block.insertAdjacentElement("afterend", fullscreenPlaceholder);

    requestAnimationFrame(() => {
      styles.top = ""
      styles.left = ""
      styles.width = "";
      styles.height = "";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = i !== block})

  } else {
    const {top, left, width, height} = fullscreenPlaceholder.getBoundingClientRect();
    styles.transition = "all 0.3s ease-in-out";

    requestAnimationFrame(() => {
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
    fullscreenPlaceholder.remove()
    fullscreenPlaceholder = undefined;

    block.style.transition = ""
    block.style.position = "";
    block.style.top = "";
    block.style.left = "";
    block.style.width = "";
    block.style.height = "";
    block.style.zIndex = "";
  }
}