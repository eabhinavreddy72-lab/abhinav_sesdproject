document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const message = document.querySelector("#dashboard-message");
  const history = document.querySelector("#order-history");
  const empty = document.querySelector("#orders-empty");

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

  try {
    const student = data.getCurrentStudent();
    if (!student) {
      window.location.replace("../login.html?next=student%2Fdashboard.html");
      return;
    }

    document.querySelector("#welcome-heading").textContent = "Welcome, " + student.name;
    document.querySelector("#student-meta").textContent =
      student.studentId + " · " + student.department + " · Year " + student.year;

    const orders = data.getOrders().filter(function (order) {
      return order && typeof order.studentId === "string" &&
        order.studentId.toLowerCase() === student.studentId.toLowerCase();
    }).sort(function (first, second) {
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });

    history.innerHTML = orders.map(function (order) {
      const itemCount = Array.isArray(order.items)
        ? order.items.reduce(function (sum, item) { return sum + (Number(item.quantity) || 0); }, 0)
        : 0;
      const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date unavailable";
      const receiptLink = order.pickupToken
        ? '<a class="flow-button flow-button-secondary" href="order-confirmation.html?orderId=' +
          encodeURIComponent(order.orderId) + '">View receipt</a>'
        : "";
      return '<article class="flow-dashboard-order">' +
        '<div><h3>' + escapeHtml(order.orderId) + '</h3>' +
          '<p>' + escapeHtml(date) + ' · ' + itemCount + (itemCount === 1 ? " item" : " items") +
          ' · ' + data.formatPrice(Number(order.total) || 0) + '</p>' +
          '<p>Pickup: ' + escapeHtml(order.pickupDate || "Not set") + ' · ' +
          escapeHtml(order.pickupTime || "Not set") + ' · Payment: ' +
          escapeHtml(order.paymentStatus || "Pending") + '</p></div>' +
        '<div><span class="flow-badge">' + escapeHtml(order.status || "PLACED") + '</span>' +
          receiptLink + '</div>' +
      '</article>';
    }).join("");
    empty.hidden = orders.length > 0;

    document.querySelector("#logout-button").addEventListener("click", function () {
      try {
        localStorage.removeItem(data.keys.session);
      } catch (error) {
        console.error("CanteenGo could not clear the student session.", error);
        showMessage("Could not sign out because browser storage is unavailable.");
        return;
      }
      window.location.href = "../login.html";
    });
  } catch (error) {
    showMessage(error.message || "Your dashboard could not be loaded.");
  }
});
