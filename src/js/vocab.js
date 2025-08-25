const vocabCards = document.querySelectorAll(".vocab-card");
const vocabCardImages = document.querySelectorAll(".vocab-card > img");

vocabCardImages.forEach(img => {
  const imgEnlarged = document.querySelector(".img-enlarged-container > img");
  img.addEventListener("click", e => {
    imgEnlarged.src = "";
    imgEnlarged.src = img.src;
  })
})