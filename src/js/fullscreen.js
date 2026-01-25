const fullscreenPlaceholder = document.createElement("div");
let fullscreened = false;
function toggleFullscreen(block, btn, transition = true) {
  fullscreened = !fullscreened;

  block.ontransitionend = (e) => {
    if (e.target === block && e.propertyName === "left") fullscreenTransition(block, btn)
  };

  const styles = block.style;

  if (!transition) {
    if (fullscreened) {
      block.classList.add("fullscreen")
      block.insertAdjacentElement("beforebegin", fullscreenPlaceholder);
      pageWrapper.querySelectorAll(".page-header, footer, main > :not(.fullscreen)").forEach(i => {i.inert = i !== block})
      styles.zIndex = 1;
    } else {
      block.classList.remove("fullscreen")
      fullscreenPlaceholder.remove();
      pageWrapper.querySelectorAll(".page-header, footer, main > *").forEach(i => {i.inert = false})
      styles.zIndex = "";
    }
    styles.transition = "none"
    block.getBoundingClientRect();
    styles.transition = "";
    return;
  }


  if (fullscreened) {
    styles.zIndex = 1;
    const {top, left, right, height} = block.getBoundingClientRect();
    styles.top = top + "px";
    styles.left = left + "px";
    styles.right = (window.innerWidth - right) + "px";
    styles.height = height + "px";

    block.classList.add("fullscreen")
    styles.transition = "all 0.3s ease-in-out";
    fullscreenPlaceholder.style.height = height + "px";
    block.insertAdjacentElement("beforebegin", fullscreenPlaceholder);

    requestAnimationFrame(() => {
      styles.top = ""
      styles.left = ""
      styles.right = "";
      styles.height = "";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, main > :not(.fullscreen)").forEach(i => {i.inert = i !== block})

  } else {
    if (fullscreenPlaceholder.offsetTop < pageWrapper.scrollTop) pageWrapper.scrollTop = fullscreenPlaceholder.offsetTop;
    fullscreenPlaceholder.style.display = "none";
    styles.transition = "none";
    block.classList.remove("fullscreen")
    const {top, left, right, height} = block.getBoundingClientRect();

    fullscreenPlaceholder.style.height = height + "px";
    fullscreenPlaceholder.style.display = "";
    block.classList.add("fullscreen")

    requestAnimationFrame(() => {
      styles.transition = "all 0.3s ease-in-out";
      styles.position = "absolute";
      styles.top = top + "px";
      styles.left = left + "px";
      styles.right = (window.innerWidth - right) + "px";
      styles.height = height + "px";
      block.classList.remove("fullscreen")
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, main > *").forEach(i => {i.inert = false})
  }
}

function fullscreenTransition(block, btn) {
  pageWrapper.inert = false;
  if (btn && document.activeElement === document.body) btn.focus()
  if (fullscreened) {
    block.style.transition = "";
  } else {
    fullscreenPlaceholder.remove();

    block.style.transition = ""
    block.style.position = "";
    block.style.top = "";
    block.style.left = "";
    block.style.height = "";
    block.style.right = "";
    block.style.zIndex = "";
  }
}