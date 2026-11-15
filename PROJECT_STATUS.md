# CanteenGo Project Status

**Project:** SR University — College Canteen Pre-Order System  
**Status date:** 15 November 2026

## Website Workflow — Client Overview

Imagine you are an SR University student visiting CanteenGo for a meal:

1. **Discover the service:** The Home page introduces the campus canteen, highlights popular dishes and categories, explains how pre-ordering works, and links to the menu, student account pages, and About/Contact sections. The SRU/CanteenGo intro plays on Home; Registration has the intro on its first visit in that browser.
2. **Browse the menu:** You can explore food without signing in. The menu presents sample dishes with descriptions, rupee prices, images, ratings, availability, and veg/non-veg labels. Search, category and diet filters, and sorting help you find an item.
3. **Build a cart:** Add dishes, change quantities, remove items, and see the item count and total. The cart is saved in this browser, so it remains when you refresh or move between pages.
4. **Create or access a student account:** Registration collects student details and checks required fields, email/mobile formats, matching passwords, and duplicate Student IDs/emails. After registration, the student signs in using Student ID or email. These are demo accounts, not university-verified identities.
5. **Review and schedule pickup:** Checkout is available to signed-in students. It shows the student, items, quantities, subtotal, current ₹0 charges, and total. The student chooses a pickup date/time and can add optional instructions. The cart and checkout draft are kept while continuing to the payment step.
6. **Choose how to pay:** For **Pay at Canteen**, the order is placed immediately and marked pending payment at pickup. For **Online Payment**, the student uses a clearly labelled local simulator with UPI/card demo options and explicit simulated success/failure controls. No bank, UPI app, gateway, or real payment details are involved.
7. **Receive the order record:** An offline order gets a unique order ID and pickup token. An online order gets those only after simulated success, along with a `DEMO-PAY` reference. A simulated failure creates neither an order nor a token and lets the student retry.
8. **Review the receipt and history:** The confirmation page shows the food, quantities, total, pickup details, payment and order statuses, and token; it can be printed. The student dashboard lists that student's saved orders. Logging out removes the current session but leaves the cart and order history in this browser.

**What powers this workflow:** The interface is the frontend, built with HTML, CSS, and vanilla JavaScript. In this prototype, the JavaScript runs in the student's browser and saves demo records to `localStorage`. There is **no backend server, API, or database**—the browser storage is not shared across devices and is not suitable for production accounts or orders. Google Fonts, Font Awesome, and remote food photos provide presentation assets; they are not authentication, ordering, or payment services. The Admin Login link is visible, but admin sign-in, order management, and status updates have not been built.

## 1. Project overview

CanteenGo is a static, browser-based prototype for SR University students to browse campus food, build a cart, select a pickup time, and place an order. It is an academic demonstration, not a production ordering or payment service.

The project uses HTML, CSS, and vanilla JavaScript. Demo accounts, carts, checkout drafts, and orders are stored in the browser's `localStorage`.

## 2. Current implementation

| Area | Status |
|---|---|
| Home page | Implemented with campus-focused sections, food highlights, navigation, and footer. |
| SRU/CanteenGo intro | Implemented on Home and Registration only. Home can replay it; Registration shows it once per browser. Reduced-motion and skip behavior are supported. |
| Food menu | Implemented with 18 sample foods in six categories, search, category and diet filters, sorting, availability, ratings, and a responsive cart. |
| Student registration and login | Implemented with form validation, duplicate Student ID/email checks, password visibility controls, and local demo sessions. |
| Checkout | Implemented with student details, cart editing, pickup date/time, optional instructions, totals, and offline/online selection. Current extra charges are ₹0. |
| Offline orders | Implemented. Creates a `PLACED` order with a unique order ID and pickup token; payment remains `PAY AT CANTEEN / PENDING`. |
| Online payment | Implemented as a local simulator for UPI, debit card, and credit card. The displayed values are fixed dummy data; no real payment details are sent or stored. |
| Confirmation and order history | Implemented with a receipt, status, print action, and a student dashboard with order history. Logout clears the session, not the cart or order records. |
| Admin | Not implemented. The Home page has an Admin Login link, but there is no admin page, dashboard, or working admin authentication behind it. No worker/staff dashboard exists. |

## 3. Pages and main files

- **Home:** [`frontend/index.html`](frontend/index.html), styled by `frontend/css/global.css` and `frontend/css/student.css`.
- **Menu:** [`frontend/student/menu.html`](frontend/student/menu.html), [`frontend/css/menu.css`](frontend/css/menu.css), and [`frontend/js/menu.js`](frontend/js/menu.js).
- **Registration and login:** [`frontend/register.html`](frontend/register.html), [`frontend/login.html`](frontend/login.html), and [`frontend/js/student-auth.js`](frontend/js/student-auth.js).
- **Checkout:** [`frontend/student/checkout.html`](frontend/student/checkout.html) and [`frontend/js/checkout.js`](frontend/js/checkout.js).
- **Simulated payment:** [`frontend/student/payment.html`](frontend/student/payment.html) and [`frontend/js/payment.js`](frontend/js/payment.js).
- **Order receipt and history:** [`frontend/student/order-confirmation.html`](frontend/student/order-confirmation.html), [`frontend/js/order-confirmation.js`](frontend/js/order-confirmation.js), [`frontend/student/dashboard.html`](frontend/student/dashboard.html), and [`frontend/js/dashboard.js`](frontend/js/dashboard.js).
- **Shared data and intro:** [`frontend/js/canteengo-data.js`](frontend/js/canteengo-data.js), [`frontend/js/splash.js`](frontend/js/splash.js), [`frontend/css/splash.css`](frontend/css/splash.css), and the logo [`frontend/assets/sru-logo.png`](frontend/assets/sru-logo.png).
- **Shared student-flow styles:** `frontend/css/student-flow.css`.

## 4. End-to-end student flow

1. A student opens Home and sees the approximately six-second intro. Registration has the same intro the first time in that browser; other pages do not load the splash code.
2. The student registers with their name, Student ID, university email, mobile number, department, year, and password. Validation runs in the browser, and a successful registration leads to Student Login.
3. The student signs in using Student ID or email and password. The demo session is kept in `localStorage`.
4. The student browses the menu, searches or filters foods, adjusts quantities, and keeps the cart across page loads and login.
5. Checkout requires a signed-in student and a non-empty cart. The student reviews their order, selects a pickup date/time, and may enter instructions.
6. **Pay at Canteen** confirms the order immediately with a pending canteen-payment status, `PLACED` order status, unique order ID, and pickup token.
7. **Online Payment** opens the local simulator. A simulated failure creates no order or token and preserves checkout/cart data. A simulated success creates a `PAID (SIMULATED)` order and a demo transaction reference before opening the receipt.
8. The student can print the receipt or view order history on the dashboard. No admin-driven status updates are currently available.

The receipt shows the planned status lifecycle: `PLACED`, `ACCEPTED`, `PREPARING`, `READY FOR PICKUP`, `COLLECTED`, and `CANCELLED`. New orders start at `PLACED`; advancing them is not implemented.

## 5. Data and security boundaries

The shared data helper in `frontend/js/canteengo-data.js` uses these browser-local keys:

- `canteengo_students_v1` — registered demo students.
- `canteengo_student_session` — current student session.
- `canteengo_menu_cart_v1` — cart contents.
- `canteengo_checkout_draft_v1` — pickup and checkout details used during checkout/payment.
- `canteengo_orders_v1` — order history.
- `canteengo_order_counter_v1` — order/token sequence.

The intro also uses `canteengo_registration_intro_seen` to remember the Registration intro in that browser.

This is **not production authentication**: student records, including passwords, are stored in browser storage without server-side protection. Data is limited to that browser/profile and can be cleared by the user. Do not enter real or reused passwords. There is no database, backend API, payment gateway, UPI transfer, or card processing.

## 6. Frontend, backend, and database status

- **Frontend:** Implemented as static responsive HTML/CSS/JavaScript pages. The project includes Google Fonts and Font Awesome links; sample food photography also uses remote image URLs.
- **Backend:** The `backend` folder currently contains no implementation files. There is no server or API.
- **Database:** None. `localStorage` is temporary demo persistence, not a shared or managed database.
- **Build/test setup:** No `package.json`, build command, or automated test suite was found. Validation so far has been manual in the browser.

## 7. Testing and recent changes

Manual browser checks have covered the core registration/login and ordering flow, offline order confirmation, simulated payment success/failure/retry, persistence, duplicate-order prevention, receipt/dashboard behavior, and mobile layout. The menu's full search/filter/sort/cart test matrix should be rerun before a presentation; there is no automated regression suite.

The latest change replaced the About-section campus photo in `frontend/index.html` with the supplied SRIX building image. The current browser preview loaded it successfully at 632 × 420 pixels and retained the existing crop/label layout. **The image still points to a local attachment path rather than a project asset**, and the hero background in `frontend/css/student.css` also uses an attachment-local path. These references may fail if the project is moved, shared, or served on another computer. Bundle both images under `frontend/assets/` and use relative URLs before distributing the project.

## 8. Running the prototype

Open the project in VS Code and open `frontend/index.html` directly in a browser, or serve the `frontend` folder with VS Code Live Server. External fonts/icons and remote food photos require internet access. Replace the attachment-local image paths with project-relative assets before relying on Live Server or sharing the project.

## 9. Development tools used

The project has been inspected and edited in VS Code using workspace listing/search/read tools (`glob`, `rg`, `view`) and targeted patches (`apply_patch`). Browser preview and browser automation (`openBrowserPage`, `readPage`, `runPlaywrightCode`, `screenshotPage`) were used for manual page and flow checks. No frontend framework, backend framework, database package, or payment SDK was added.
