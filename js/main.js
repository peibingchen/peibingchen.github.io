const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeGlyph = themeToggle?.querySelector(".theme-glyph");
const themeText = themeToggle?.querySelector(".theme-text");
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const isDark = theme === "dark";

  root.dataset.theme = theme;

  if (themeGlyph) themeGlyph.textContent = isDark ? "☀" : "☾";
  if (themeText) themeText.textContent = isDark ? "Light" : "Dark";
  if (themeColor) themeColor.content = isDark ? "#111214" : "#f5f4f0";
  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

applyTheme(root.dataset.theme || "light");

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
});

const navigationLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const topbar = document.querySelector(".topbar");
let navigationUpdateQueued = false;

function updateActiveNavigation() {
  if (!sections.length) return;

  const activationLine = (topbar?.offsetHeight || 0) + window.innerHeight * 0.2;
  let activeSection = sections[0];

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeSection = section;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    activeSection = sections[sections.length - 1];
  }

  navigationLinks.forEach((link) => {
    link.classList.toggle("active", link.hash === `#${activeSection.id}`);
  });

  navigationUpdateQueued = false;
}

function requestNavigationUpdate() {
  if (navigationUpdateQueued) return;

  navigationUpdateQueued = true;
  window.requestAnimationFrame(updateActiveNavigation);
}

window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
window.addEventListener("resize", requestNavigationUpdate);
window.addEventListener("hashchange", requestNavigationUpdate);
updateActiveNavigation();

const currentYear = document.querySelector("#current-year");

if (currentYear) currentYear.textContent = new Date().getFullYear();
