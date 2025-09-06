const fullscreenPlaceholder = document.createElement("div")
let fullscreened = false;
let fullscreenScroll = 0;
function toggleFullscreen(block, btn) {
  fullscreened = !fullscreened;

  block.ontransitionend = (e) => {
    if (e.target === block && e.propertyName === "left") fullscreenTransition(block, btn)
  };

  const scrollbar = getScrollbarWidth();
  const styles = block.style;
  if (fullscreened) {
    fullscreenScroll = pageWrapper.scrollTop;
    styles.top = block.offsetTop + "px";
    styles.left = block.offsetLeft + "px";
    styles.right = (pageWrapper.offsetWidth - block.offsetLeft - block.offsetWidth) + "px";
    styles.bottom = (pageWrapper.offsetHeight - block.offsetTop - block.offsetHeight) + "px";

    block.insertAdjacentElement("beforebegin", fullscreenPlaceholder);
    fullscreenPlaceholder.style.height = block.offsetHeight + "px";

    const computedWrapperPadding = window.getComputedStyle(pageWrapper).paddingRight;
    pageWrapper.style.transition = "none";
    pageWrapper.style.paddingRight = (scrollbar + parseInt(computedWrapperPadding)) + "px";
    pageWrapper.style.overflow = "hidden"
    block.classList.add("fullscreen")

    requestAnimationFrame(() => {
      styles.left = "0px";
      styles.right = "0px";
      styles.top = pageWrapper.scrollTop + "px";
      styles.bottom = -pageWrapper.scrollTop + "px";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = i !== block})

  } else {
    block.classList.remove("fullscreen")
    fullscreenPlaceholder.style.display = "none";
    pageWrapper.style.overflow = "";
    pageWrapper.style.paddingRight = "";
    block.getBoundingClientRect();

    const offsetTop = block.offsetTop;
    const offsetLeft = block.offsetLeft
    const offsetWidth = block.offsetWidth;
    const offsetHeight = block.offsetHeight;

    block.classList.add("fullscreen")
    fullscreenPlaceholder.style.display = "";
    pageWrapper.style.overflow = "hidden"
    const computedWrapperPadding = window.getComputedStyle(pageWrapper).paddingRight;
    pageWrapper.style.paddingRight = (scrollbar + parseInt(computedWrapperPadding)) + "px";
    block.getBoundingClientRect();
    block.style.transition = "";


    requestAnimationFrame(() => {
      block.classList.remove("fullscreen")
      styles.top = offsetTop + "px";
      styles.left = offsetLeft + "px";
      styles.right = (pageWrapper.offsetWidth - offsetLeft - offsetWidth) + "px";
      styles.bottom = (pageWrapper.offsetHeight - offsetTop - offsetHeight) + "px";
      styles.position = "absolute";
      pageWrapper.inert = true;
    })
    pageWrapper.querySelectorAll(".page-header, footer, .content-block").forEach(i => {i.inert = false})
  }
}

window.addEventListener("resize", () => {
  pageWrapper.scrollTop = fullscreenScroll;
})

function fullscreenTransition(block, btn) {
  pageWrapper.inert = false;
  if(btn && document.activeElement === document.body) btn.focus()
  if (fullscreened) {
    block.style.transition = "none";
  } else {
    fullscreenPlaceholder.remove()
    pageWrapper.style.overflow = "";
    pageWrapper.style.paddingRight = "";
    pageWrapper.getBoundingClientRect()
    pageWrapper.style.transition = ""

    block.style.position = "";
    block.style.top = "";
    block.style.left = "";
    block.style.bottom = "";
    block.style.right = "";
  }
}



function getScrollbarWidth() {
  // Create a temporary div element
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // Force scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar'; // For IE/Edge
  document.body.appendChild(outer);

  // Create an inner div with a width of 100%
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculate the scrollbar width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Remove the temporary elements
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}