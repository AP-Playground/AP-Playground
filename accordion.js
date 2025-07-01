document.querySelectorAll('.accordion-button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.target.parentElement.classList.toggle('open')
  })
});