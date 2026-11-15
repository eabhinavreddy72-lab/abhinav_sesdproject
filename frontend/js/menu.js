document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const cartStorageKey = data.keys.cart;
  const foods = data.foods;

  const foodGrid = document.querySelector("#food-grid");
  const searchInput = document.querySelector("#food-search");
  const dietFilter = document.querySelector("#diet-filter");
  const sortSelect = document.querySelector("#sort-select");
  const resultsCount = document.querySelector("#results-count");
  const emptyState = document.querySelector("#empty-state");
  const categoryTabs = document.querySelector("#category-tabs");
  const cartCount = document.querySelector("#cart-count");
  const cartToggle = document.querySelector("#cart-toggle");
  const cartDrawer = document.querySelector("#cart-drawer");
  const cartBackdrop = document.querySelector("#cart-backdrop");
  const cartClose = document.querySelector("#cart-close");
  const cartLines = document.querySelector("#cart-lines");
  const cartEmpty = document.querySelector("#cart-empty");
  const cartFooter = document.querySelector("#cart-drawer-footer");
  const cartTotal = document.querySelector("#cart-total");
  const drawerCount = document.querySelector("#drawer-count");
  const loginNote = document.querySelector("#cart-login-note");
  const checkoutButton = document.querySelector("#checkout-button");
  const toast = document.querySelector("#menu-toast");
  const navToggle = document.querySelector("#menu-nav-toggle");
  const navLinks = document.querySelector("#menu-nav-links");
  let activeCategory = "all";
  let toastTimer = 0;
  let cart = readCart();

  function showMessage(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  function readCart() {
    try {
      const savedCart = localStorage.getItem(cartStorageKey);
      if (!savedCart) {
        return {};
      }

      const parsedCart = JSON.parse(savedCart);
      if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
        showMessage("Your saved cart could not be read. Start a new cart to continue.");
        return {};
      }

      const validCart = {};
      Object.entries(parsedCart).forEach(function (entry) {
        const food = foods.find(function (item) { return item.id === entry[0]; });
        const quantity = Number(entry[1]);
        if (food && Number.isInteger(quantity) && quantity > 0) {
          validCart[food.id] = quantity;
        }
      });
      return validCart;
    } catch (error) {
      showMessage("Cart storage is unavailable in this browser.");
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
      return true;
    } catch (error) {
      showMessage("Your browser could not save the cart. Keep this tab open.");
      return false;
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  }

  function getQuantity(foodId) {
    return cart[foodId] || 0;
  }

  function getFoodCardControl(food) {
    const quantity = getQuantity(food.id);
    if (!food.available) {
      return '<button class="menu-button" type="button" disabled>Currently unavailable</button>';
    }
    if (!quantity) {
      return '<button class="menu-button menu-button-primary" type="button" data-action="add" data-id="' + food.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add to cart</button>';
    }

    return '<div class="food-quantity" aria-label="Quantity for ' + food.name + '">' +
      '<button type="button" data-action="decrease" data-id="' + food.id + '" aria-label="Decrease ' + food.name + ' quantity"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>' +
      '<span>' + quantity + '</span>' +
      '<button type="button" data-action="increase" data-id="' + food.id + '" aria-label="Increase ' + food.name + ' quantity"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>' +
      '</div>';
  }

  function renderFoods() {
    const query = searchInput.value.trim().toLowerCase();
    const diet = dietFilter.value;
    const sort = sortSelect.value;
    let visibleFoods = foods.filter(function (food) {
      const matchesCategory = activeCategory === "all" || food.category === activeCategory;
      const matchesDiet = diet === "all" || food.type === diet;
      const matchesSearch = !query ||
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query);
      return matchesCategory && matchesDiet && matchesSearch;
    });

    if (sort === "price-low") {
      visibleFoods = visibleFoods.slice().sort(function (a, b) { return a.price - b.price; });
    } else if (sort === "price-high") {
      visibleFoods = visibleFoods.slice().sort(function (a, b) { return b.price - a.price; });
    } else if (sort === "rating") {
      visibleFoods = visibleFoods.slice().sort(function (a, b) { return b.rating - a.rating; });
    }

    foodGrid.innerHTML = visibleFoods.map(function (food) {
      const typeLabel = food.type === "veg" ? "Veg" : "Non-veg";
      const availabilityLabel = food.available ? "Available" : "Unavailable";
      return '<article class="food-card">' +
        '<div class="food-card-image">' +
          '<img src="' + food.image + '" alt="' + food.name + '" loading="lazy">' +
          '<span class="food-category-badge">' + food.category + '</span>' +
          '<span class="food-availability' + (food.available ? "" : " is-unavailable") + '">' + availabilityLabel + '</span>' +
        '</div>' +
        '<div class="food-card-body">' +
          '<div class="food-card-title-row"><h3>' + food.name + '</h3><span class="food-rating"><i class="fa-solid fa-star" aria-hidden="true"></i>' + food.rating.toFixed(1) + '</span></div>' +
          '<p class="food-description">' + food.description + '</p>' +
          '<div class="food-meta"><span class="food-diet"><span class="diet-icon' + (food.type === "non-veg" ? " is-non-veg" : "") + '" aria-hidden="true"></span>' + typeLabel + '</span></div>' +
          '<div class="food-card-footer"><strong class="food-price"><small>₹</small>' + food.price + '</strong>' + getFoodCardControl(food) + '</div>' +
        '</div>' +
      '</article>';
    }).join("");

    resultsCount.textContent = visibleFoods.length + (visibleFoods.length === 1 ? " item" : " items") + " on the menu";
    emptyState.hidden = visibleFoods.length > 0;
    foodGrid.hidden = visibleFoods.length === 0;
    updateCartSummary();
  }

  function getCartItems() {
    return Object.keys(cart).map(function (foodId) {
      const food = foods.find(function (item) { return item.id === foodId; });
      return food ? { food: food, quantity: cart[foodId] } : null;
    }).filter(Boolean);
  }

  function updateCartSummary() {
    const items = getCartItems();
    const unitCount = items.reduce(function (sum, line) { return sum + line.quantity; }, 0);
    const total = items.reduce(function (sum, line) { return sum + line.food.price * line.quantity; }, 0);

    cartCount.textContent = String(unitCount);
    cartToggle.setAttribute("aria-label", "Open cart, " + unitCount + (unitCount === 1 ? " item" : " items"));
    drawerCount.textContent = "(" + unitCount + ")";
    cartTotal.textContent = formatPrice(total);
    cartEmpty.hidden = items.length > 0;
    cartLines.hidden = items.length === 0;
    cartFooter.hidden = items.length === 0;
    loginNote.textContent = isStudentLoggedIn()
      ? "Your cart is saved. Continue to checkout to choose a pickup slot."
      : "You can browse freely. Student login is required to continue.";

    cartLines.innerHTML = items.map(function (line) {
      const food = line.food;
      return '<article class="cart-line">' +
        '<img src="' + food.image + '" alt="" loading="lazy">' +
        '<div class="cart-line-main"><h3>' + food.name + '</h3>' +
          '<p>' + line.quantity + ' × ' + formatPrice(food.price) + '</p>' +
          '<div class="cart-line-actions">' +
            '<div class="food-quantity" aria-label="Quantity for ' + food.name + '">' +
              '<button type="button" data-cart-action="decrease" data-id="' + food.id + '" aria-label="Decrease ' + food.name + ' quantity"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>' +
              '<span>' + line.quantity + '</span>' +
              '<button type="button" data-cart-action="increase" data-id="' + food.id + '" aria-label="Increase ' + food.name + ' quantity"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>' +
            '</div>' +
            '<button class="cart-line-remove" type="button" data-cart-action="remove" data-id="' + food.id + '">Remove</button>' +
          '</div>' +
        '</div>' +
        '<strong class="cart-line-price">' + formatPrice(food.price * line.quantity) + '</strong>' +
      '</article>';
    }).join("");
  }

  function changeQuantity(foodId, change) {
    const food = foods.find(function (item) { return item.id === foodId; });
    if (!food || !food.available) {
      return;
    }

    const nextQuantity = getQuantity(foodId) + change;
    if (nextQuantity > 0) {
      cart[foodId] = nextQuantity;
    } else {
      delete cart[foodId];
    }

    saveCart();
    renderFoods();
    if (!cartDrawer.hidden) {
      updateCartSummary();
    }
  }

  function openCart() {
    cartBackdrop.hidden = false;
    cartDrawer.hidden = false;
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-is-open");
    window.requestAnimationFrame(function () {
      cartBackdrop.classList.add("is-open");
      cartDrawer.classList.add("is-open");
    });
    cartToggle.setAttribute("aria-expanded", "true");
    cartClose.focus();
  }

  function closeCart() {
    if (cartDrawer.hidden) {
      return;
    }

    cartBackdrop.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-is-open");
    cartToggle.setAttribute("aria-expanded", "false");
    window.setTimeout(function () {
      cartDrawer.hidden = true;
      cartBackdrop.hidden = true;
    }, 300);
    cartToggle.focus();
  }

  function isStudentLoggedIn() {
    try {
      return Boolean(data.getCurrentStudent());
    } catch (error) {
      showMessage(error.message);
      return false;
    }
  }

  function continueToCheckout() {
    if (!isStudentLoggedIn()) {
      window.location.href = "../login.html?next=student%2Fcheckout.html";
      return;
    }

    window.location.href = "checkout.html";
  }

  function clearFilters() {
    activeCategory = "all";
    searchInput.value = "";
    dietFilter.value = "all";
    sortSelect.value = "recommended";
    categoryTabs.querySelectorAll(".category-tab").forEach(function (tab) {
      const isActive = tab.dataset.category === "all";
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    renderFoods();
  }

  foodGrid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }

    const foodId = button.dataset.id;
    if (button.dataset.action === "add" || button.dataset.action === "increase") {
      changeQuantity(foodId, 1);
      showMessage("Added to your cart.");
    } else if (button.dataset.action === "decrease") {
      changeQuantity(foodId, -1);
    }
  });

  cartLines.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cart-action]");
    if (!button) {
      return;
    }

    const foodId = button.dataset.id;
    if (button.dataset.cartAction === "increase") {
      changeQuantity(foodId, 1);
    } else if (button.dataset.cartAction === "decrease") {
      changeQuantity(foodId, -1);
    } else if (button.dataset.cartAction === "remove") {
      delete cart[foodId];
      saveCart();
      renderFoods();
    }
  });

  categoryTabs.addEventListener("click", function (event) {
    const tab = event.target.closest("[data-category]");
    if (!tab) {
      return;
    }

    activeCategory = tab.dataset.category;
    categoryTabs.querySelectorAll(".category-tab").forEach(function (categoryTab) {
      const isActive = categoryTab === tab;
      categoryTab.classList.toggle("is-active", isActive);
      categoryTab.setAttribute("aria-pressed", String(isActive));
    });
    renderFoods();
  });

  searchInput.addEventListener("input", renderFoods);
  dietFilter.addEventListener("change", renderFoods);
  sortSelect.addEventListener("change", renderFoods);
  document.querySelector("#clear-filters").addEventListener("click", clearFilters);
  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartBackdrop.addEventListener("click", closeCart);
  document.querySelector("#continue-browsing").addEventListener("click", closeCart);
  checkoutButton.addEventListener("click", continueToCheckout);
  document.querySelector("#clear-cart").addEventListener("click", function () {
    cart = {};
    saveCart();
    renderFoods();
    showMessage("Your cart has been cleared.");
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-bars" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      navLinks.classList.toggle("is-open", !isOpen);
    });
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape") {
      closeCart();
      if (navLinks) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
        navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      }
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 720 && navLinks) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
      navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }
  });

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  renderFoods();

  const checkoutRequested = new URLSearchParams(window.location.search).get("checkout") === "1";
  if (checkoutRequested && isStudentLoggedIn()) {
    openCart();
    showMessage("Your saved cart is ready. Continue to checkout to choose a pickup slot.");
  }
});
