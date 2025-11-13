document.addEventListener("DOMContentLoaded", () => {
  const productData = JSON.parse(localStorage.getItem("selectedProduct"));

  // Redirect if no product selected
  if (!productData) {
    window.location.href = "product-page.html";
    return;
  }

  // Safe setters
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  const setSrc = (id, src) => {
    const el = document.getElementById(id);
    if (el) el.src = src;
  };

  // Populate product details
  setText("breadcrumbTitle", productData.title);
  setText("productTitle", productData.title);
  setText("productPriceMain", `NPR ${productData.price.toLocaleString()}`);
  setText("productPriceBox", `NPR ${productData.price.toLocaleString()}`);
  setHTML("productBrand", `Brand: <span class="fw-semibold">${productData.brand}</span>`);
  setHTML("productCategory", `Category: <span class="fw-semibold">${productData.category}</span>`);
  setSrc("ProductImage", productData.image);

  // Gallery thumbnails
  document.querySelectorAll(".thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      setSrc("ProductImage", thumb.src);
    });
  });

  // Color buttons
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const img = btn.getAttribute("data-image");
      setSrc("ProductImage", img);
    });
  });

  // Size selection
  let selectedSize = "";
  document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.textContent;
    });
  });

  // Quantity
  const qtyInput = document.getElementById("quantity");

  // Update Cart Counter and Total
  function updateCartSummary() {
    const CART_LS_KEY = "cartItems";
    let cart = [];
    if (window.cartHelpers && typeof window.cartHelpers.getCart === "function") {
      cart = window.cartHelpers.getCart() || [];
    } else {
      cart = JSON.parse(localStorage.getItem(CART_LS_KEY)) || JSON.parse(localStorage.getItem("cart")) || [];
    }
    let totalQty = 0;
    let totalPrice = 0;
    cart.forEach(item => {
      totalQty += item.quantity;
      totalPrice += item.price * item.quantity;
    });

    const badge = document.querySelector(".cart-icon .badge");
    if (badge) badge.textContent = totalQty;

    const total = document.querySelector(".total-price");
    if (total) total.textContent = `NRS.${totalPrice.toLocaleString()}`;
  }
  updateCartSummary();

  // Add to Cart
  const addBtn = document.getElementById("addToCartBtn");
  if (addBtn && qtyInput) {
    addBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput.value) || 1;
      const itemToAdd = Object.assign({}, productData, {
        size: selectedSize || "Default",
        quantity
      });

      if (window.cartHelpers && typeof window.cartHelpers.addToCart === "function") {
        window.cartHelpers.addToCart(itemToAdd);
      } else {
        // fallback to legacy localStorage key but prefer unified CART_LS_KEY
        const CART_LS_KEY = "cartItems";
        const cart = JSON.parse(localStorage.getItem(CART_LS_KEY)) || JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = cart.findIndex(p => p.id === itemToAdd.id && p.size === itemToAdd.size);
        if (existingIndex > -1) {
          cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 0) + quantity;
        } else {
          cart.push(itemToAdd);
        }
        localStorage.setItem(CART_LS_KEY, JSON.stringify(cart));
        try {
          const totalCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: totalCount } }));
        } catch (e) { }
      }
      updateCartSummary();
      alert("Product added to cart!");
    });
  }

  // Buy Now
  const buyBtn = document.getElementById("buyNowBtn");
  if (buyBtn && qtyInput) {
    buyBtn.addEventListener("click", () => {
      const quantity = parseInt(qtyInput.value) || 1;
      const itemToAdd = Object.assign({}, productData, {
        size: selectedSize || "Default",
        quantity
      });
      if (window.cartHelpers && typeof window.cartHelpers.setCart === "function") {
        window.cartHelpers.setCart([itemToAdd]);
      } else {
        const CART_LS_KEY = "cartItems";
        localStorage.setItem(CART_LS_KEY, JSON.stringify([itemToAdd]));
        try {
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: itemToAdd.quantity } }));
        } catch (e) { }
      }
      window.location.href = "cart.html";
    });
  }

  // Related Products click (make whole card clickable)
  document.querySelectorAll(".carousel .card").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault(); // stop default <a href="#"> if used

      const title = card.querySelector(".card-title")?.textContent || "Untitled";
      const priceText = card.querySelector(".card-text")?.textContent || "NRS.0";
      const price = parseFloat(priceText.replace("NRS.", "").trim()) || 0;
      const image = card.querySelector("img")?.src || "";

      const relatedProduct = {
        id: Date.now(),
        title,
        price,
        brand: "RelatedBrand",
        category: "Related",
        image
      };

      localStorage.setItem("selectedProduct", JSON.stringify(relatedProduct));
      window.location.href = "product-details-page.html";
    });
  });

});
