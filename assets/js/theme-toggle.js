// Theme toggle for Hypertext Garden style
(function() {
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    document.querySelector('.theme-toggle').setAttribute('aria-pressed', mode === 'dark');
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }
  document.addEventListener('DOMContentLoaded', function() {
    let mode = localStorage.getItem('theme');
    // Default to light mode if no preference is set
    if (!mode) {
      mode = 'light';
    }
    setTheme(mode);
    const btn = document.querySelector('.theme-toggle');
    if(btn) btn.addEventListener('click', toggleTheme);
  });
})();
