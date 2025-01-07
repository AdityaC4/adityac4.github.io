document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Default is dark (no "light-theme" class).
  themeToggleBtn.addEventListener("click", () => {
    body.classList.toggle("light-theme");
  });
});

