
document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  const navbarTotalEl = document.querySelector(".total-price");

  // Use the unified localStorage key used across the site
  const CART_LS_KEY = "cartItems";

  // Load cart from localStorage (items may include quantity)
  let cart = JSON.parse(localStorage.getItem(CART_LS_KEY)) || [];

  // Render Cart Items
  function renderCart() {
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="text-center text-muted">🛒 Your cart is empty.</p>`;
      cartTotalEl.textContent = "NRS.0.00";
      cartCountEl.textContent = "0";
      navbarTotalEl.textContent = "NRS.0.00";
      return;
    }

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      count += item.quantity;

      const col = document.createElement("div");
      col.className = "col-12 d-flex align-items-center border rounded p-3";

      col.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="me-3" style="width:80px;height:80px;object-fit:cover;">
        <div class="flex-grow-1">
          <h5 class="mb-1">${item.title}</h5>
          <p class="mb-1 text-muted">Brand: ${item.brand || "N/A"} | Size: ${item.size || "Default"}</p>
          <p class="mb-1 fw-semibold">NRS.${item.price.toLocaleString()}</p>
          
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary decreaseQty">-</button>
            <input type="number" class="form-control mx-2 text-center cartQty" style="width:60px;" value="${item.quantity}" min="1">
            <button class="btn btn-sm btn-outline-secondary increaseQty">+</button>
            <button class="btn btn-sm btn-danger ms-3 removeItem"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      `;

      // Quantity decrease
      col.querySelector(".decreaseQty").addEventListener("click", () => {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          saveCart();
        }
      });

      // Quantity increase
      col.querySelector(".increaseQty").addEventListener("click", () => {
        cart[index].quantity += 1;
        saveCart();
      });

      // Manual quantity input
      col.querySelector(".cartQty").addEventListener("change", (e) => {
        let newQty = parseInt(e.target.value);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        cart[index].quantity = newQty;
        saveCart();
      });

      // Remove item
      col.querySelector(".removeItem").addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
      });

      cartContainer.appendChild(col);
    });

    cartTotalEl.textContent = `NRS.${total.toLocaleString()}`;
    cartCountEl.textContent = count;
    navbarTotalEl.textContent = `NRS.${total.toLocaleString()}`;
  }

  // Save & Re-render
  function saveCart() {
    localStorage.setItem(CART_LS_KEY, JSON.stringify(cart));
    // notify other listeners/tabs
    try {
      const totalCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
      window.dispatchEvent(
        new CustomEvent("cart-updated", { detail: { count: totalCount } })
      );
    } catch (e) { }
    renderCart();
  }

  // react to storage changes from other tabs
  window.addEventListener("storage", (e) => {
    if (e.key === CART_LS_KEY) {
      try {
        cart = JSON.parse(e.newValue) || [];
      } catch (err) {
        cart = [];
      }
      renderCart();
    }
  });

  // react to in-page cart updates (dispatched by site helpers)
  window.addEventListener("cart-updated", (ev) => {
    try {
      cart = JSON.parse(localStorage.getItem(CART_LS_KEY)) || [];
    } catch (e) {
      cart = [];
    }
    renderCart();
  });

  renderCart();
});
