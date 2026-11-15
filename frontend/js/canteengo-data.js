(function () {
  const keys = {
    students: "canteengo_students_v1",
    session: "canteengo_student_session",
    cart: "canteengo_menu_cart_v1",
    orders: "canteengo_orders_v1",
    orderCounter: "canteengo_order_counter_v1",
    checkoutDraft: "canteengo_checkout_draft_v1"
  };

  const foods = [
    { id: "masala-dosa", name: "Masala Dosa", description: "Crisp dosa filled with spiced potato, served with chutney.", price: 85, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=85", category: "Breakfast", type: "veg", available: true, rating: 4.8 },
    { id: "idli-sambar", name: "Idli & Sambar", description: "Soft steamed idlis with warm sambar and coconut chutney.", price: 55, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85", category: "Breakfast", type: "veg", available: true, rating: 4.6 },
    { id: "egg-dosa", name: "Egg Dosa", description: "Golden dosa topped with egg, onion and campus-style masala.", price: 95, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=85", category: "Breakfast", type: "non-veg", available: true, rating: 4.5 },
    { id: "veg-thali", name: "Veg Campus Thali", description: "A comforting plate with rice, dal, vegetables and accompaniments.", price: 110, image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85", category: "Lunch", type: "veg", available: true, rating: 4.7 },
    { id: "chicken-meal", name: "Chicken Curry Meal", description: "Rice and homestyle chicken curry for a filling lunch break.", price: 145, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85", category: "Lunch", type: "non-veg", available: true, rating: 4.6 },
    { id: "paneer-meal", name: "Paneer Rice Bowl", description: "Spiced paneer and rice with a fresh, satisfying finish.", price: 125, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=85", category: "Lunch", type: "veg", available: false, rating: 4.4 },
    { id: "chicken-biryani", name: "Chicken Biryani", description: "Aromatic basmati rice layered with spiced chicken.", price: 160, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85", category: "Biryani", type: "non-veg", available: true, rating: 4.9 },
    { id: "veg-biryani", name: "Veg Dum Biryani", description: "Fragrant dum-cooked rice with seasonal vegetables.", price: 125, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85", category: "Biryani", type: "veg", available: true, rating: 4.6 },
    { id: "egg-biryani", name: "Egg Biryani", description: "Spiced basmati rice with boiled eggs and herbs.", price: 135, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=85", category: "Biryani", type: "non-veg", available: true, rating: 4.5 },
    { id: "chicken-burger", name: "Chicken Burger", description: "Grilled chicken, crisp lettuce and a soft toasted bun.", price: 129, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85", category: "Fast Food", type: "non-veg", available: true, rating: 4.6 },
    { id: "paneer-roll", name: "Paneer Kathi Roll", description: "Spiced paneer and crunchy vegetables wrapped to go.", price: 99, image: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=800&q=85", category: "Fast Food", type: "veg", available: true, rating: 4.5 },
    { id: "masala-noodles", name: "Masala Noodles", description: "Wok-tossed noodles with vegetables and campus masala.", price: 90, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=85", category: "Fast Food", type: "veg", available: false, rating: 4.3 },
    { id: "samosa", name: "Samosa", description: "Crisp pastry filled with a warm, spiced potato mixture.", price: 25, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85", category: "Snacks", type: "veg", available: true, rating: 4.7 },
    { id: "veg-puff", name: "Vegetable Puff", description: "Flaky baked pastry packed with seasoned vegetables.", price: 30, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85", category: "Snacks", type: "veg", available: true, rating: 4.4 },
    { id: "paneer-pakora", name: "Paneer Pakora", description: "Crisp-battered paneer bites with a cool chutney dip.", price: 75, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85", category: "Snacks", type: "veg", available: true, rating: 4.5 },
    { id: "mango-lassi", name: "Mango Lassi", description: "A chilled, creamy mango yogurt drink.", price: 55, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=85", category: "Beverages", type: "veg", available: true, rating: 4.7 },
    { id: "fresh-lime-soda", name: "Fresh Lime Soda", description: "A refreshing lime cooler, served chilled.", price: 40, image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=85", category: "Beverages", type: "veg", available: true, rating: 4.5 },
    { id: "filter-coffee", name: "Filter Coffee", description: "South Indian filter coffee for a perfect campus pause.", price: 35, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85", category: "Beverages", type: "veg", available: true, rating: 4.8 }
  ];

  function readJson(key, fallback) {
    let value;
    try {
      value = localStorage.getItem(key);
    } catch (error) {
      console.error("CanteenGo could not access local storage.", error);
      throw new Error("Browser storage is unavailable. Please enable local storage and try again.");
    }
    if (value === null) {
      return fallback;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("CanteenGo found invalid saved data for " + key + ".", error);
      throw new Error("Saved demo data is invalid. Clear this app's demo storage and try again.");
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("CanteenGo could not save " + key + ".", error);
      throw new Error("Browser storage could not save your changes. Check available storage and try again.");
    }
  }

  function getStudents() {
    const students = readJson(keys.students, []);
    if (!Array.isArray(students)) {
      throw new Error("Saved student data is invalid.");
    }
    return students;
  }

  function getCart() {
    const cart = readJson(keys.cart, {});
    if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
      throw new Error("Saved cart data is invalid.");
    }
    return cart;
  }

  function saveCart(cart) {
    writeJson(keys.cart, cart);
  }

  function getOrders() {
    const orders = readJson(keys.orders, []);
    if (!Array.isArray(orders)) {
      throw new Error("Saved order data is invalid.");
    }
    return orders;
  }

  function getSession() {
    let value;
    try {
      value = localStorage.getItem(keys.session);
    } catch (error) {
      console.error("CanteenGo could not access the student session.", error);
      throw new Error("Browser storage is unavailable. Please enable local storage and try again.");
    }
    if (!value) {
      return null;
    }
    try {
      const session = JSON.parse(value);
      return session && typeof session.studentId === "string" ? session : null;
    } catch (error) {
      console.error("CanteenGo found an invalid student session.", error);
      return null;
    }
  }

  function getCurrentStudent() {
    const session = getSession();
    if (!session) {
      return null;
    }
    return getStudents().find(function (student) {
      return student.studentId.toLowerCase() === session.studentId.toLowerCase();
    }) || null;
  }

  function getNextOrderIdentity(orders) {
    if (!Array.isArray(orders)) {
      throw new Error("Saved order data is invalid.");
    }

    let sequence = readJson(keys.orderCounter, 0);
    if (!Number.isInteger(sequence) || sequence < 0) {
      throw new Error("Saved order counter is invalid.");
    }

    let orderId = "";
    let pickupToken = "";
    do {
      sequence += 1;
      const suffix = String(sequence).padStart(6, "0");
      orderId = "CG-" + new Date().getFullYear() + "-" + suffix;
      pickupToken = "SRU-" + suffix;
    } while (orders.some(function (order) {
      return order && (order.orderId === orderId || order.pickupToken === pickupToken);
    }));

    return {
      sequence: sequence,
      orderId: orderId,
      pickupToken: pickupToken
    };
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  }

  window.CanteenGoData = {
    keys: keys,
    foods: foods,
    readJson: readJson,
    writeJson: writeJson,
    getStudents: getStudents,
    getCart: getCart,
    saveCart: saveCart,
    getOrders: getOrders,
    getSession: getSession,
    getCurrentStudent: getCurrentStudent,
    getNextOrderIdentity: getNextOrderIdentity,
    formatPrice: formatPrice
  };
})();
