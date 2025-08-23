document.addEventListener("DOMContentLoaded", () => {
  const vocabCards = document.querySelectorAll(".vocab-card");
  const vocabCardImages = document.querySelectorAll(".vocab-card > img");
  const imgEnlargedContainer = document.querySelector(".img-enlarged-container");
  const imgEnlarged = document.querySelector(".img-enlarged-container > img");

  vocabCardImages.forEach(img => {
    img.addEventListener("click", e => {
      imgEnlarged.src = img.src;
    })
  })

  imgEnlarged.addEventListener("load", e => {
    imgEnlargedContainer.classList.add("active")
  })

  imgEnlargedContainer.addEventListener("click", e => {
    imgEnlargedContainer.classList.remove("active")
  })
})