document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Default is dark (no "light-theme" class).
  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("light-theme");
  });
});

const aboutText =
  "Aspiring Software and Cybersecurity Engineer passionate about secure, " +
  "scalable applications. Currently pursuing a Bachelor's in Computer and " +
  "Information Science at MSU, I have hands-on experience in full-stack " +
  "development, cybersecurity competitions/labs, and cloud technologies.";

let index = 0;
function typeEffect() {
  if (index < aboutText.length) {
    document.getElementById('about-text').innerHTML += aboutText.charAt(index);
    index++;
    setTimeout(typeEffect, 1);
  }
}
document.addEventListener('DOMContentLoaded', typeEffect);


