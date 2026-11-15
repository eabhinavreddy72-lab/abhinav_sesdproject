document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-links");
  const currentYear = document.querySelector("#current-year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (!menuToggle || !navigation) {
    return;
  }

  const menuBreakpoint = Number(menuToggle.dataset.menuBreakpoint) || 800;

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    navigation.classList.remove("is-open");
  }

  menuToggle.addEventListener("click", function () {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-bars" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > menuBreakpoint) {
      closeMenu();
    }
  });
});
