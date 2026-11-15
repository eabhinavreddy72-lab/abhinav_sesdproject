document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const pageMessage = document.querySelector("#payment-page-message");
  const pageContent = document.querySelector("#payment-page-content");
  const processing = document.querySelector("#payment-processing");
  const payButton = document.querySelector("#pay-now-button");
  const upiPanel = document.querySelector("#upi-panel");
  const cardPanel = document.querySelector("#card-panel");
  const charges = 0;
  let student;
  let draft;
  let cart;
  let items = [];
  let subtotal = 0;
  let isProcessing = false;
  let completed = false;

  function showMessage(text, kind) {
    pageMessage.textContent = text;
    pageMessage.className = "flow-message" + (kind ? " is-" + kind : "");
    pageMessage.hidden = false;
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

  function getCartSignature(cartValue) {
    return JSON.stringify(Object.keys(cartValue).sort().map(function (id) {
      return [id, cartValue[id]];
    }));
  }

  function localDateValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function loadOrderContext() {
    student = data.getCurrentStudent();
    if (!student) {
      window.location.replace("../login.html?next=student%2Fpayment.html");
      return false;
    }

    cart = data.getCart();
    draft = data.readJson(data.keys.checkoutDraft, null);
    if (!draft || typeof draft.id !== "string" ||
        draft.studentId !== student.studentId ||
        draft.signature !== getCartSignature(cart)) {
      throw new Error("Your saved checkout details do not match the current cart. Return to checkout and try again.");
    }

    const orders = data.getOrders();
    const existingOrder = orders.find(function (order) {
      return order && order.checkoutId === draft.id &&
        order.studentId === student.studentId && order.pickupToken;
    });
    if (existingOrder) {
      window.location.replace("order-confirmation.html?orderId=" + encodeURIComponent(existingOrder.orderId));
      return false;
    }

    const ids = Object.keys(cart);
    if (!ids.length) {
      throw new Error("Your cart is empty. Return to the menu to add food.");
    }
    items = ids.map(function (id) {
      const food = data.foods.find(function (item) { return item.id === id; });
      const quantity = Number(cart[id]);
      if (!food || !Number.isInteger(quantity) || quantity <= 0 || !food.available) {
        return null;
      }
      return { food: food, quantity: quantity };
    });
    if (items.some(function (item) { return !item; })) {
      throw new Error("Your cart includes an unavailable or invalid item. Return to checkout to update it.");
    }

    if (typeof draft.pickupDate !== "string" ||
        draft.pickupDate < localDateValue(new Date()) ||
        typeof draft.pickupTime !== "string" || !draft.pickupTime.trim()) {
      throw new Error("Pickup details are missing or out of date. Return to checkout and select a date and time.");
    }
    return true;
  }

  function renderSummary() {
    subtotal = items.reduce(function (sum, line) {
      return sum + line.food.price * line.quantity;
    }, 0);
    document.querySelector("#payment-student").innerHTML =
      "<strong>" + escapeHtml(student.name) + "</strong><small>" +
      escapeHtml(student.studentId) + " · " + escapeHtml(student.email) + "</small>";
    document.querySelector("#payment-items").innerHTML = items.map(function (line) {
      return '<article class="payment-order-line">' +
        '<img src="' + escapeHtml(line.food.image) + '" alt="" loading="lazy">' +
        '<div><strong>' + escapeHtml(line.food.name) + '</strong>' +
          '<small>' + line.quantity + " × " + data.formatPrice(line.food.price) + "</small></div>" +
        "<strong>" + data.formatPrice(line.food.price * line.quantity) + "</strong></article>";
    }).join("");
    document.querySelector("#payment-subtotal").textContent = data.formatPrice(subtotal);
    document.querySelector("#payment-charges").textContent = data.formatPrice(charges);
    document.querySelector("#payment-total").textContent = data.formatPrice(subtotal + charges);
    document.querySelector("#payment-amount-badge").textContent = data.formatPrice(subtotal + charges);
    document.querySelector("#payment-pickup").innerHTML =
      "<small>Scheduled pickup</small><strong>" + escapeHtml(draft.pickupDate) +
      " · " + escapeHtml(draft.pickupTime) + "</strong>";
  }

  function selectedPaymentMethod() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    return selected ? selected.value : "";
  }

  function selectedOutcome() {
    const selected = document.querySelector('input[name="simulatedOutcome"]:checked');
    return selected ? selected.value : "";
  }

  function makePaidOrder(method) {
    const activeStudent = data.getCurrentStudent();
    const activeCart = data.getCart();
    const activeDraft = data.readJson(data.keys.checkoutDraft, null);
    if (!activeStudent || activeStudent.studentId !== student.studentId ||
        !activeDraft || activeDraft.id !== draft.id ||
        activeDraft.signature !== getCartSignature(activeCart) ||
        activeDraft.studentId !== activeStudent.studentId) {
      throw new Error("Your login or cart changed during payment. Review checkout and retry.");
    }

    const orders = data.getOrders();
    const existingOrder = orders.find(function (order) {
      return order && order.checkoutId === draft.id && order.studentId === student.studentId;
    });
    if (existingOrder) {
      return existingOrder;
    }

    const currentItems = Object.keys(activeCart).map(function (id) {
      const food = data.foods.find(function (item) { return item.id === id; });
      const quantity = Number(activeCart[id]);
      if (!food || !food.available || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("A menu item is no longer available. Return to checkout before paying.");
      }
      return {
        id: food.id,
        name: food.name,
        image: food.image,
        price: food.price,
        quantity: quantity
      };
    });
    const currentSubtotal = currentItems.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
    const methodLabels = {
      upi: "UPI (Simulated)",
      debit: "Debit Card (Simulated)",
      credit: "Credit Card (Simulated)"
    };
    if (!methodLabels[method]) {
      throw new Error("Choose a simulated payment method.");
    }

    const identity = data.getNextOrderIdentity(orders);
    const order = {
      orderId: identity.orderId,
      pickupToken: identity.pickupToken,
      checkoutId: draft.id,
      studentId: student.studentId,
      studentName: student.name,
      items: currentItems,
      subtotal: currentSubtotal,
      charges: charges,
      total: currentSubtotal + charges,
      pickupDate: activeDraft.pickupDate,
      pickupTime: activeDraft.pickupTime,
      instructions: activeDraft.instructions || "",
      paymentMethod: methodLabels[method],
      paymentStatus: "PAID (SIMULATED)",
      transactionReference: "DEMO-PAY-" + String(identity.sequence).padStart(4, "0"),
      status: "PLACED",
      createdAt: new Date().toISOString()
    };

    data.writeJson(data.keys.orders, orders.concat(order));
    data.writeJson(data.keys.orderCounter, identity.sequence);
    data.saveCart({});
    try {
      localStorage.removeItem(data.keys.checkoutDraft);
    } catch (error) {
      console.error("CanteenGo could not clear the checkout draft.", error);
    }
    return order;
  }

  function updateMethodPanels() {
    const method = selectedPaymentMethod();
    upiPanel.hidden = method !== "upi";
    cardPanel.hidden = method !== "debit" && method !== "credit";
  }

  function setSimulationControlsDisabled(disabled) {
    document.querySelectorAll('input[name="paymentMethod"], input[name="simulatedOutcome"]')
      .forEach(function (input) {
        input.disabled = disabled;
      });
  }

  function processPayment() {
    if (isProcessing || completed) {
      return;
    }
    const method = selectedPaymentMethod();
    const outcome = selectedOutcome();
    if (!method) {
      showMessage("Choose a demo payment method first.", "error");
      return;
    }
    if (outcome !== "success" && outcome !== "failure") {
      showMessage("Choose a simulator test result.", "error");
      return;
    }

    isProcessing = true;
    payButton.disabled = true;
    processing.hidden = false;
    setSimulationControlsDisabled(true);
    showMessage("DEMO / SIMULATED PAYMENT: no money is being transferred.", "");

    window.setTimeout(function () {
      processing.hidden = true;
      isProcessing = false;
      if (outcome === "failure") {
        payButton.disabled = false;
        payButton.textContent = "Retry Simulated Payment";
        setSimulationControlsDisabled(false);
        showMessage("Simulated payment failed. No payment was taken, no order or pickup token was created, and your cart and checkout details are saved. Select simulated success and retry.", "error");
        return;
      }

      try {
        const order = makePaidOrder(method);
        completed = true;
        showMessage("Simulated payment succeeded. Saving your confirmed order…", "success");
        window.setTimeout(function () {
          window.location.href = "order-confirmation.html?orderId=" + encodeURIComponent(order.orderId);
        }, 700);
      } catch (error) {
        payButton.disabled = false;
        payButton.textContent = "Retry Simulated Payment";
        let persisted;
        try {
          persisted = data.getOrders().find(function (order) {
            return order && order.checkoutId === draft.id && order.studentId === student.studentId;
          });
        } catch (storageError) {
          console.error("CanteenGo could not verify the saved simulated order.", storageError);
        }
        if (persisted && persisted.pickupToken) {
          window.location.href = "order-confirmation.html?orderId=" + encodeURIComponent(persisted.orderId);
          return;
        }
        setSimulationControlsDisabled(false);
        showMessage(error.message || "The simulated order could not be saved. Your cart remains available.", "error");
      }
    }, 1100);
  }

  try {
    if (!loadOrderContext()) {
      return;
    }
    renderSummary();
    pageContent.hidden = false;
    document.querySelectorAll('input[name="paymentMethod"]').forEach(function (input) {
      input.addEventListener("change", updateMethodPanels);
    });
    payButton.addEventListener("click", processPayment);
    updateMethodPanels();
  } catch (error) {
    showMessage(error.message || "The simulated payment page could not be loaded.", "error");
  }
});
