const vocabCards = document.querySelectorAll(".vocab-card");
const vocabCardImages = document.querySelectorAll(".vocab-card > img");
const imgEnlarged = document.querySelector(".img-enlarged-container > img");

vocabCardImages.forEach(img => {
  img.addEventListener("click", e => {
    imgEnlarged.src = "";
    imgEnlarged.src = img.src;
  })
})