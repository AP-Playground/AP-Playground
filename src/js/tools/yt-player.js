const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const videoPlayer = document.querySelector(".video-block .video-embed")
const videoBlock = document.querySelector(".video-block")

let prevURL = "";
document.getElementById("url-input").addEventListener("input", (e) => {
  const url = e.target.value.match(regex)
  if (url && prevURL === url[1]) {
    videoBlock.classList.add("active")
    return
  };
  if (url) {
    videoBlock.classList.add("active")
    videoPlayer.src = "https://www.youtube-nocookie.com/embed/" + url[1] + "?enablejsapi=1";
    prevURL = url[1]
  } else {
    videoBlock.classList.remove("active")
    videoPlayer.contentWindow.postMessage(
      '{"event":"command","func":"pauseVideo","args":""}',
      '*'
    );
  }
})