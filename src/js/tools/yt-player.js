const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const videoPlayer = document.querySelector(".video-block .video-embed")
const videoBlock = document.querySelector(".video-block")

const urlInput = document.getElementById("url-input");
const loadUrl = new URL(window.location.href)
const loadParams = loadUrl.searchParams;
let prevURL = "";

if (loadParams.has("v")) {
  const v = loadParams.get("v")
  urlInput.value = "www.youtube.com/watch?v=" + v;
  videoLoad(v)
  toggleFullscreen(videoBlock, null, false)
}

urlInput.addEventListener("input", (e) => {
  const url = e.target.value.match(regex)
  if (url && prevURL === url[1]) {
    videoBlock.classList.add("active")
    return
  };
  if (url) {
    videoLoad(url[1])
  } else {
    videoBlock.classList.remove("active")
    videoPlayer.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*'
    );
  }
})

function videoLoad(url) {
  videoBlock.classList.add("active")
  videoPlayer.src = "https://www.youtube-nocookie.com/embed/" + url + "?enablejsapi=1";
  prevURL = url
  const currentUrl = new URL(window.location.href); const params = currentUrl.searchParams; params.set("v", url);
  const newUrl = currentUrl.pathname + "?" + params.toString() + currentUrl.hash
  window.history.pushState({path: newUrl}, "", newUrl)
}

const videoControls = document.querySelector(".module-controls")
const videoFullscreen = videoControls.querySelector(".fullscreen")
const videoLink = videoControls.querySelector(".copy-link");

videoFullscreen.addEventListener("click", () => {
  videoFullscreen.classList.toggle("active");
  toggleFullscreen(videoBlock, videoFullscreen)
})


videoLink.addEventListener("click", () => {
  const currentUrl = new URL(window.location.href);
  copyToClipboard(currentUrl.toString())
})


async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}