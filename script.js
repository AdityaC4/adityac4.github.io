// Theme management

function setTheme(theme) {
  // Remove any previous theme-* class
  document.documentElement.className = document.documentElement.className
    .split(/\s+/)
    .filter((c) => !c.startsWith("theme-"))
    .join(" ");
  if (theme !== "white") {
    document.documentElement.classList.add("theme-" + theme);
  }
  localStorage.setItem("theme", theme);
}

// Load saved theme on page load
document.addEventListener("DOMContentLoaded", function () {
  const savedTheme = localStorage.getItem("theme") || "white";
  setTheme(savedTheme);
});
