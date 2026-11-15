document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const message = document.querySelector("#checkout-message");
  const content = document.querySelector("#checkout-content");
  const emptyCart = document.querySelector("#empty-cart");
  const itemsContainer = document.querySelector("#checkout-items");
  const form = document.querySelector("#checkout-form");
  const submitButton = document.querySelector("#confirm-order-button");
  const onlineNote = document.querySelector("#online-payment-note");
  const pickupDate = document.querySelector("#pickup-date");
  const pickupTime = document.querySelector("#pickup-time");
  const charges = 0;
  let student;
  let cart;
  let checkoutItems = [];
  let subtotal = 0;
  let submitting = false;
  let draftId = "";
  let cartSignature = "";

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "flow-message" + (kind ? " is-" + kind : "");
    message.hidden = false;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function localDateValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function getCartSignature(cartValue) {
    return JSON.stringify(Object.keys(cartValue).sort().map(function (id) {
      return [id, cartValue[id]];
    }));
  }

  function getCheckoutDetails() {
    return {
      pickupDate: pickupDate.value,
      pickupTime: pickupTime.value,
      instructions: form.querySelector("#instructions").value.trim(),
      paymentMethod: form.querySelector('input[name="paymentMethod"]:checked').value
    };
  }

  function buildCartItems() {
    return Object.keys(cart).map(function (foodId) {
      const food = data.foods.find(function (item) { return item.id === foodId; });
      const quantity = Number(cart[foodId]);
      if (!food || !Number.isInteger(quantity) || quantity <= 0) {
        return null;
      }
      return { food: food, quantity: quantity };
    }).filter(Boolean);
  }

  function updateSummary() {
    subtotal = checkoutItems.reduce(function (sum, line) {
      return sum + line.food.price * line.quantity;
    }, 0);
    document.querySelector("#subtotal").textContent = data.formatPrice(subtotal);
    document.querySelector("#charges").textContent = data.formatPrice(charges);
    document.querySelector("#grand-total").textContent = data.formatPrice(subtotal + charges);
  }

  function updateDraft(details) {
    const signature = getCartSignature(cart);
    try {
      const existing = data.readJson(data.keys.checkoutDraft, null);
      const reusable = existing && existing.signature === signature &&
        existing.studentId === student.studentId && typeof existing.id === "string";
      const draft = reusable
        ? Object.assign({}, existing)
        : { id: "draft-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10) };
      draft.signature = signature;
      draft.studentId = student.studentId;
      if (details) {
        Object.assign(draft, details);
      }
      data.writeJson(data.keys.checkoutDraft, draft);
      draftId = draft.id;
      cartSignature = signature;
      return true;
    } catch (error) {
      showMessage(error.message, "error");
      draftId = "";
      return false;
    }
  }

  function renderItems() {
    checkoutItems = buildCartItems();
    itemsContainer.innerHTML = checkoutItems.map(function (line) {
      const food = line.food;
      const unavailable = !food.available;
      return '<article class="flow-order-line">' +
        '<img src="' + escapeHtml(food.image) + '" alt="' + escapeHtml(food.name) + '" loading="lazy">' +
        '<div><h3>' + escapeHtml(food.name) + (unavailable ? " · unavailable" : "") + '</h3>' +
          '<p>' + escapeHtml(food.description) + '</p>' +
          '<div class="flow-quantity" aria-label="Quantity for ' + escapeHtml(food.name) + '">' +
            '<button type="button" data-cart-action="decrease" data-id="' + escapeHtml(food.id) + '" aria-label="Decrease ' + escapeHtml(food.name) + ' quantity">−</button>' +
            '<span>' + line.quantity + '</span>' +
            '<button type="button" data-cart-action="increase" data-id="' + escapeHtml(food.id) + '" aria-label="Increase ' + escapeHtml(food.name) + ' quantity"' + (unavailable ? " disabled" : "") + '>+</button>' +
          '</div>' +
          '<button class="flow-remove" type="button" data-cart-action="remove" data-id="' + escapeHtml(food.id) + '">Remove</button>' +
        '</div>' +
        '<strong class="flow-line-price">' + data.formatPrice(food.price) + ' each<br>' + data.formatPrice(food.price * line.quantity) + '</strong>' +
      '</article>';
    }).join("");
    updateSummary();
    submitButton.disabled = checkoutItems.length === 0 || checkoutItems.some(function (line) {
      return !line.food.available;
    });
    if (checkoutItems.some(function (line) { return !line.food.available; })) {
      showMessage("Remove unavailable dishes before placing this order.", "error");
    }
    updateDraft();
  }

  function setStudentSummary() {
    const summary = document.querySelector("#student-summary");
    summary.innerHTML =
      '<div><small>Student name</small><strong>' + escapeHtml(student.name) + '</strong></div>' +
      '<div><small>Student ID</small><strong>' + escapeHtml(student.studentId) + '</strong></div>' +
      '<div><small>University email</small><strong>' + escapeHtml(student.email) + '</strong></div>' +
      '<div><small>Department · Year</small><strong>' + escapeHtml(student.department) + ' · Year ' + escapeHtml(student.year) + '</strong></div>';
  }

  function placeOfflineOrder() {
    const currentCart = data.getCart();
    const currentSignature = getCartSignature(currentCart);
    if (currentSignature !== cartSignature || !draftId) {
      throw new Error("Your cart changed. Review the updated order before confirming.");
    }

    const orders = data.getOrders();
    const duplicate = orders.find(function (order) {
      return order && order.checkoutId === draftId && order.studentId === student.studentId;
    });
    if (duplicate) {
      window.location.replace("order-confirmation.html?orderId=" + encodeURIComponent(duplicate.orderId));
      return;
    }

    const identity = data.getNextOrderIdentity(orders);
    const order = {
      orderId: identity.orderId,
      pickupToken: identity.pickupToken,
      checkoutId: draftId,
      studentId: student.studentId,
      studentName: student.name,
      items: checkoutItems.map(function (line) {
        return {
          id: line.food.id,
          name: line.food.name,
          image: line.food.image,
          price: line.food.price,
          quantity: line.quantity
        };
      }),
      subtotal: subtotal,
      charges: charges,
      total: subtotal + charges,
      pickupDate: pickupDate.value,
      pickupTime: pickupTime.value,
      instructions: form.querySelector("#instructions").value.trim(),
      paymentMethod: "Pay at Canteen",
      paymentStatus: "PAY AT CANTEEN / PENDING",
      status: "PLACED",
      createdAt: new Date().toISOString()
    };

    const updatedOrders = orders.concat(order);
    data.writeJson(data.keys.orders, updatedOrders);
    data.writeJson(data.keys.orderCounter, identity.sequence);
    data.saveCart({});
    try {
      localStorage.removeItem(data.keys.checkoutDraft);
    } catch (error) {
      console.error("CanteenGo could not clear the checkout draft.", error);
    }
    window.location.href = "order-confirmation.html?orderId=" + encodeURIComponent(order.orderId);
  }

  try {
    student = data.getCurrentStudent();
    if (!student) {
      window.location.replace("../login.html?next=student%2Fcheckout.html");
      return;
    }
    cart = data.getCart();
    setStudentSummary();
    pickupDate.min = localDateValue(new Date());
    pickupDate.value = pickupDate.min;

    const orders = data.getOrders();
    const savedDraft = data.readJson(data.keys.checkoutDraft, null);
    const existingOrder = savedDraft && orders.find(function (order) {
      return order && order.checkoutId === savedDraft.id && order.studentId === student.studentId;
    });
    if (existingOrder) {
      window.location.replace("order-confirmation.html?orderId=" + encodeURIComponent(existingOrder.orderId));
      return;
    }

    renderItems();
    if (savedDraft && savedDraft.signature === cartSignature &&
        savedDraft.studentId === student.studentId) {
      if (typeof savedDraft.pickupDate === "string" && savedDraft.pickupDate >= pickupDate.min) {
        pickupDate.value = savedDraft.pickupDate;
      }
      if (typeof savedDraft.pickupTime === "string") {
        pickupTime.value = savedDraft.pickupTime;
      }
      if (typeof savedDraft.instructions === "string") {
        form.querySelector("#instructions").value = savedDraft.instructions;
      }
      if (savedDraft.paymentMethod === "online") {
        form.querySelector('input[name="paymentMethod"][value="online"]').checked = true;
        onlineNote.hidden = false;
      }
    }
    if (!checkoutItems.length) {
      content.hidden = true;
      emptyCart.hidden = false;
    }
  } catch (error) {
    content.hidden = true;
    showMessage(error.message || "Checkout could not be loaded.", "error");
    return;
  }

  itemsContainer.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cart-action]");
    if (!button || submitting) {
      return;
    }
    const foodId = button.dataset.id;
    const food = data.foods.find(function (item) { return item.id === foodId; });
    if (!food) {
      showMessage("This menu item is no longer available.", "error");
      return;
    }

    if (button.dataset.cartAction === "remove") {
      delete cart[foodId];
    } else if (button.dataset.cartAction === "increase" && food.available) {
      cart[foodId] = (Number(cart[foodId]) || 0) + 1;
    } else if (button.dataset.cartAction === "decrease") {
      cart[foodId] = (Number(cart[foodId]) || 0) - 1;
      if (cart[foodId] <= 0) {
        delete cart[foodId];
      }
    }

    try {
      data.saveCart(cart);
      renderItems();
      emptyCart.hidden = checkoutItems.length > 0;
      content.hidden = checkoutItems.length === 0;
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  form.addEventListener("change", function (event) {
    if (event.target.name === "paymentMethod") {
      onlineNote.hidden = event.target.value !== "online";
    }
    if (event.target.id === "pickup-date" || event.target.id === "pickup-time" ||
        event.target.name === "paymentMethod") {
      updateDraft(getCheckoutDetails());
    }
  });

  form.querySelector("#instructions").addEventListener("input", function () {
    updateDraft(getCheckoutDetails());
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    if (!form.reportValidity()) {
      showMessage("Choose a pickup date and an available time slot.", "error");
      return;
    }
    if (pickupDate.value < localDateValue(new Date())) {
      showMessage("Pickup date cannot be in the past.", "error");
      pickupDate.focus();
      return;
    }

    const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked').value;
    if (!updateDraft(getCheckoutDetails())) {
      return;
    }
    if (paymentMethod === "online") {
      let currentSignature;
      try {
        currentSignature = getCartSignature(data.getCart());
      } catch (error) {
        showMessage(error.message || "Your saved cart could not be checked.", "error");
        return;
      }
      if (currentSignature !== cartSignature) {
        showMessage("Your cart changed. Review the updated order before continuing.", "error");
        return;
      }
      window.location.href = "payment.html";
      return;
    }
    if (!checkoutItems.length || checkoutItems.some(function (line) { return !line.food.available; })) {
      showMessage("Add available menu items before confirming your order.", "error");
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    try {
      placeOfflineOrder();
    } catch (error) {
      let persisted;
      try {
        persisted = data.getOrders().find(function (order) {
          return order && order.checkoutId === draftId && order.studentId === student.studentId;
        });
      } catch (storageError) {
        console.error("CanteenGo could not verify the saved offline order.", storageError);
      }
      if (persisted) {
        window.location.href = "order-confirmation.html?orderId=" + encodeURIComponent(persisted.orderId);
        return;
      }
      submitting = false;
      submitButton.disabled = false;
      showMessage(error.message || "The order could not be saved. Your cart has been kept.", "error");
    }
  });

  document.querySelector("#logout-button").addEventListener("click", function () {
    try {
      localStorage.removeItem(data.keys.session);
    } catch (error) {
      console.error("CanteenGo could not clear the student session.", error);
      showMessage("Could not sign out because browser storage is unavailable.", "error");
      return;
    }
    window.location.href = "../login.html";
  });
});
