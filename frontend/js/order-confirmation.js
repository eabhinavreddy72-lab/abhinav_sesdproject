document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const message = document.querySelector("#confirmation-message");
  const receipt = document.querySelector("#receipt");
  const statusSteps = [
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY FOR PICKUP",
    "COLLECTED",
    "CANCELLED"
  ];

  function showMessage(text) {
    message.textContent = text;
    message.className = "flow-message is-error";
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

  function detail(label, value) {
    return "<div><small>" + escapeHtml(label) + "</small><strong>" + escapeHtml(value) + "</strong></div>";
  }

  try {
    const student = data.getCurrentStudent();
    if (!student) {
      window.location.replace("../login.html?next=student%2Fdashboard.html");
      return;
    }

    const orderId = new URLSearchParams(window.location.search).get("orderId");
    const order = data.getOrders().find(function (item) {
      return item && item.orderId === orderId &&
        item.studentId.toLowerCase() === student.studentId.toLowerCase();
    });
    if (!order || !order.pickupToken) {
      showMessage("This order receipt is unavailable for your account.");
      return;
    }

    document.querySelector("#pickup-token").textContent = order.pickupToken;
    document.querySelector("#order-details").innerHTML =
      detail("Order ID", order.orderId) +
      detail("Student", order.studentName) +
      detail("Student ID", order.studentId) +
      detail("Pickup date", order.pickupDate) +
      detail("Pickup time", order.pickupTime) +
      detail("Payment method", order.paymentMethod) +
      detail("Payment status", order.paymentStatus) +
      (order.transactionReference
        ? detail("Demo transaction reference", order.transactionReference)
        : "");

    document.querySelector("#receipt-items").innerHTML = order.items.map(function (item) {
      return "<tr><td>" + escapeHtml(item.name) + "</td>" +
        "<td>" + escapeHtml(item.quantity) + "</td>" +
        "<td>" + data.formatPrice(item.price) + "</td>" +
        "<td>" + data.formatPrice(item.price * item.quantity) + "</td></tr>";
    }).join("");
    document.querySelector("#receipt-subtotal").textContent = data.formatPrice(order.subtotal);
    document.querySelector("#receipt-charges").textContent = data.formatPrice(order.charges);
    document.querySelector("#receipt-total").textContent = data.formatPrice(order.total);
    document.querySelector("#order-status").textContent = order.status;
    document.querySelector("#order-status-list").innerHTML = statusSteps.map(function (status) {
      const current = status === order.status;
      return '<li' + (current ? ' class="is-current" aria-current="step"' : "") + '>' +
        escapeHtml(status) + (current ? " · Current status" : "") + "</li>";
    }).join("");

    document.querySelector("#print-receipt").addEventListener("click", function () {
      window.print();
    });
    receipt.hidden = false;
    document.title = "Order " + order.orderId + " | CanteenGo";
  } catch (error) {
    showMessage(error.message || "The order receipt could not be loaded.");
  }
});
