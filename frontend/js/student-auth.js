document.addEventListener("DOMContentLoaded", function () {
  const data = window.CanteenGoData;
  const form = document.querySelector("#student-auth-form");
  if (!data || !form) {
    return;
  }

  const message = document.querySelector("#form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  function showMessage(text, kind) {
    message.textContent = text;
    message.className = "flow-message" + (kind ? " is-" + kind : "");
    message.hidden = false;
  }

  function clearMessage() {
    message.textContent = "";
    message.hidden = true;
    message.className = "flow-message";
  }

  form.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.passwordToggle);
      const visible = input.type === "password";
      input.type = visible ? "text" : "password";
      button.textContent = visible ? "Hide" : "Show";
      button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    });
  });

  form.addEventListener("invalid", function (event) {
    showMessage(event.target.validationMessage || "Please check the highlighted fields.", "error");
  }, true);
  form.addEventListener("input", clearMessage);

  if (form.dataset.mode === "register") {
    const password = form.querySelector("#password");
    const confirmPassword = form.querySelector("#confirm-password");

    confirmPassword.addEventListener("input", function () {
      confirmPassword.setCustomValidity(
        confirmPassword.value && confirmPassword.value !== password.value
          ? "Passwords do not match."
          : ""
      );
    });
    password.addEventListener("input", function () {
      confirmPassword.setCustomValidity(
        confirmPassword.value && confirmPassword.value !== password.value
          ? "Passwords do not match."
          : ""
      );
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      confirmPassword.setCustomValidity(
        confirmPassword.value !== password.value ? "Passwords do not match." : ""
      );
      if (!form.reportValidity()) {
        showMessage("Please check the highlighted fields and try again.", "error");
        return;
      }

      const student = {
        name: form.querySelector("#full-name").value.trim(),
        studentId: form.querySelector("#student-id").value.trim(),
        email: form.querySelector("#university-email").value.trim().toLowerCase(),
        mobile: form.querySelector("#mobile").value.trim(),
        department: form.querySelector("#department").value,
        year: form.querySelector("#year").value,
        password: password.value,
        createdAt: new Date().toISOString()
      };

      if (!/^[6-9]\d{9}$/.test(student.mobile)) {
        showMessage("Enter a valid 10-digit Indian mobile number.", "error");
        form.querySelector("#mobile").focus();
        return;
      }

      try {
        const students = data.getStudents();
        const idExists = students.some(function (item) {
          return item.studentId.toLowerCase() === student.studentId.toLowerCase();
        });
        if (idExists) {
          showMessage("That Student ID is already registered. Use your existing account or check the ID.", "error");
          form.querySelector("#student-id").focus();
          return;
        }
        const emailExists = students.some(function (item) {
          return item.email.toLowerCase() === student.email;
        });
        if (emailExists) {
          showMessage("That email is already registered. Please sign in instead.", "error");
          form.querySelector("#university-email").focus();
          return;
        }

        students.push(student);
        data.writeJson(data.keys.students, students);
        showMessage("Registration complete. Redirecting you to Student Login…", "success");
        submitButton.disabled = true;
        window.setTimeout(function () {
          window.location.href = "login.html?registered=1";
        }, 900);
      } catch (error) {
        showMessage(error.message || "Registration could not be saved.", "error");
      }
    });
  } else {
    const registeredNotice = new URLSearchParams(window.location.search).get("registered") === "1";
    if (registeredNotice) {
      showMessage("Registration saved. Sign in with your Student ID or email.", "success");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) {
        showMessage("Enter your Student ID or email and password.", "error");
        return;
      }

      const identity = form.querySelector("#identity").value.trim().toLowerCase();
      const password = form.querySelector("#password").value;
      try {
        const student = data.getStudents().find(function (item) {
          return item.studentId.toLowerCase() === identity || item.email.toLowerCase() === identity;
        });
        if (!student || student.password !== password) {
          showMessage("Student ID/email or password is incorrect.", "error");
          return;
        }

        data.writeJson(data.keys.session, {
          studentId: student.studentId,
          signedInAt: new Date().toISOString()
        });
        const requestedNext = new URLSearchParams(window.location.search).get("next");
        const allowedNext = ["student/dashboard.html", "student/checkout.html", "student/menu.html", "student/payment.html"];
        const destination = allowedNext.indexOf(requestedNext) >= 0
          ? requestedNext
          : "student/dashboard.html";
        showMessage("Signed in successfully. Opening your CanteenGo page…", "success");
        submitButton.disabled = true;
        window.setTimeout(function () {
          window.location.href = destination;
        }, 450);
      } catch (error) {
        showMessage(error.message || "Sign in could not be completed.", "error");
      }
    });
  }
});
