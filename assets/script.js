document.addEventListener("DOMContentLoaded", () => {
  const CART_LS_KEY = "cartItems";
  const WISHLIST_LS_KEY = "wishlistItems";

  // --- Shop / product area ---
  const productList = document.getElementById("productList");
  const paginationEl = document.getElementById("pagination");
  if (!productList) {
    console.warn("No #productList found; shop logic skipped.");
  }

  const allProducts = productList
    ? Array.from(productList.querySelectorAll(".product"))
    : [];
  allProducts.forEach((p, i) => (p.dataset.originalIndex = i));
  let filteredProducts = [...allProducts];

  const itemsPerPage = 6;
  let currentPage = 1;

  const sortSelect = document.getElementById("sortProducts");
  const searchInput = document.querySelector(".search-container input");
  const productCountEl = document.getElementById("productCount");
  const priceRange =
    document.getElementById("priceRange") ||
    document.getElementById("mPriceRange");
  const priceValue =
    document.getElementById("priceValue") ||
    document.getElementById("mPriceValue");


  document.getElementById("searchProduct")

  /* -----------------------
     Bottom nav / badges
     -----------------------*/
  const bottomNav = document.getElementById("bottomNav");
  const navLinks = bottomNav ? bottomNav.querySelectorAll(".nav-link") : [];
  // detect cart/wishlist links (match by href or a data-role attr if you add one)
  const cartLink = bottomNav
    ? bottomNav.querySelector('a[href*="cart"]') ||
    bottomNav.querySelector('[data-role="cart"]')
    : null;
  const wishlistLink = bottomNav
    ? bottomNav.querySelector('a[href*="wishlist"]') ||
    bottomNav.querySelector('[data-role="wishlist"]')
    : null;

  /* =======================
     Helper: localStorage safe parsing & counts
     ======================= */
  function parseLS(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse localStorage for", key, e);
      return [];
    }
  }
  function writeLS(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set localStorage", key, e);
    }
  }
  function getCount(key) {
    const parsed = parseLS(key);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.length === "number") return parsed.length;
      return Object.keys(parsed).length;
    }
    return 0;
  }

  // Return total quantity for cart-like arrays (sum of item.quantity or 1)
  function getTotalQuantity(key) {
    const parsed = parseLS(key);
    if (!Array.isArray(parsed)) return 0;
    return parsed.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
  }

  /* =======================
     Badges: create/update
     ======================= */
  function getOrCreateBadge(link) {
    if (!link) return null;
    let badge = link.querySelector(".bottom-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className =
        "position-absolute top-0 start-50 translate-end badge rounded-pill bg-danger bottom-badge";
      badge.style.fontSize = "0.55rem";
      badge.style.transform = "translateX(12px) translateY(-6px)";
      link.style.position = "relative";
      link.appendChild(badge);
    }
    return badge;
  }

  function updateBadges() {
    // show total quantity (sum of quantities) for cart to keep counts consistent
    const cartCount = getTotalQuantity(CART_LS_KEY);
    const wishCount = getCount(WISHLIST_LS_KEY);

    // Update any header cart count elements (#cartCount) so header and bottom nav stay in sync
    try {
      document.querySelectorAll("#cartCount").forEach((el) => {
        if (cartCount > 0) {
          el.textContent = cartCount;
          el.style.display = "inline-block";
          el.setAttribute("aria-label", `${cartCount} items in cart`);
        } else {
          // show zero or hide depending on existing markup; keep text to 0 for accessibility
          el.textContent = "0";
        }
      });
    } catch (e) {
      /* ignore if header elements are missing */
    }
    if (cartLink) {
      const b = getOrCreateBadge(cartLink);
      if (cartCount > 0) {
        b.textContent = cartCount;
        b.style.display = "inline-block";
        b.setAttribute("aria-label", `${cartCount} items in cart`);
      } else {
        b.style.display = "none";
        b.textContent = "";
        b.removeAttribute("aria-label");
      }
    }

    if (wishlistLink) {
      const b = getOrCreateBadge(wishlistLink);
      if (wishCount > 0) {
        b.textContent = wishCount;
        b.style.display = "inline-block";
        b.setAttribute("aria-label", `${wishCount} items in wishlist`);
      } else {
        b.style.display = "none";
        b.textContent = "";
        b.removeAttribute("aria-label");
      }
    }
  }

  // initialize badges now
  updateBadges();

  // react to other tabs
  window.addEventListener("storage", (e) => {
    if (e.key === CART_LS_KEY || e.key === WISHLIST_LS_KEY) updateBadges();
  });

  /* Expose some helpers globally */
  window.cartHelpers = {
    getCart: () => parseLS(CART_LS_KEY),
    setCart: (arr) => {
      writeLS(CART_LS_KEY, arr);
      updateBadges();
      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: { count: getTotalQuantity(CART_LS_KEY) },
        })
      );
    },
    addToCart: (item) => {
      const arr = parseLS(CART_LS_KEY) || [];
      // ensure quantity is present
      const toAdd = Object.assign({}, item, { quantity: Number(item.quantity) || 1 });
      arr.push(toAdd);
      writeLS(CART_LS_KEY, arr);
      updateBadges();
      window.dispatchEvent(
        new CustomEvent("cart-updated", { detail: { count: getTotalQuantity(CART_LS_KEY) } })
      );
    },
    clearCart: () => {
      writeLS(CART_LS_KEY, []);
      updateBadges();
    },
  };
  window.wishlistHelpers = {
    getWishlist: () => parseLS(WISHLIST_LS_KEY),
    setWishlist: (arr) => {
      writeLS(WISHLIST_LS_KEY, arr);
      updateBadges();
      window.dispatchEvent(
        new CustomEvent("wishlist-updated", {
          detail: { count: getCount(WISHLIST_LS_KEY) },
        })
      );
    },
    addToWishlist: (item) => {
      const arr = parseLS(WISHLIST_LS_KEY) || [];
      arr.push(item);
      writeLS(WISHLIST_LS_KEY, arr);
      updateBadges();
      window.dispatchEvent(
        new CustomEvent("wishlist-updated", { detail: { count: arr.length } })
      );
    },
    clearWishlist: () => {
      writeLS(WISHLIST_LS_KEY, []);
      updateBadges();
    },
  };

  /* =======================
     Shop Functions (filters / sort / pagination)
     ======================= */
  function getTitle(el) {
    return (
      el.dataset.title ||
      el.querySelector(".product-title")?.textContent ||
      el.querySelector("h6")?.textContent ||
      ""
    )
      .trim()
      .toLowerCase();
  }

  function applySort() {
    const val = sortSelect?.value || "none";
    if (val === "low-high")
      filteredProducts.sort(
        (a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price)
      );
    else if (val === "high-low")
      filteredProducts.sort(
        (a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price)
      );
    else if (val === "a-z")
      filteredProducts.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    else if (val === "z-a")
      filteredProducts.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
    else
      filteredProducts.sort(
        (a, b) =>
          parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex)
      );
  }

  function renderProducts() {
    if (!productList) return;
    productList.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredProducts.slice(start, end);
    productsToShow.forEach((p) => productList.appendChild(p));

    if (productCountEl)
      productCountEl.textContent = `${filteredProducts.length} Products`;

    renderPagination();
  }

  function renderPagination() {
    if (!paginationEl) return;
    paginationEl.innerHTML = "";

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Previous Button
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    const prevA = document.createElement("a");
    prevA.className = "page-link";
    prevA.href = "#";
    prevA.textContent = "Pre...";
    prevA.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    prevLi.appendChild(prevA);
    paginationEl.appendChild(prevLi);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === currentPage ? "active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      li.appendChild(a);
      paginationEl.appendChild(li);
    }

    // Next Button
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""
      }`;
    const nextA = document.createElement("a");
    nextA.className = "page-link";
    nextA.href = "#";
    nextA.textContent = "Next";
    nextA.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    nextLi.appendChild(nextA);
    paginationEl.appendChild(nextLi);
  }

  function applyFilters() {
    currentPage = 1;
    const term = (searchInput?.value || "").trim().toLowerCase();
    const activeCategories = Array.from(
      document.querySelectorAll(".category-filter:checked")
    ).map((el) => el.value.toLowerCase());
    const activeBrands = Array.from(
      document.querySelectorAll(".brand-filter:checked")
    ).map((el) => el.value.toLowerCase());
    const maxPriceVal = parseFloat(
      priceRange?.value || priceRange?.max || 10000
    );
    if (priceValue) priceValue.textContent = maxPriceVal;

    filteredProducts = allProducts.filter((p) => {
      const titleMatch = !term || getTitle(p).includes(term);
      const categoryMatch =
        activeCategories.length === 0 ||
        activeCategories.includes((p.dataset.category || "").toLowerCase());
      const brandMatch =
        activeBrands.length === 0 ||
        activeBrands.includes((p.dataset.brand || "").toLowerCase());
      const priceMatch = parseFloat(p.dataset.price) <= maxPriceVal;
      return titleMatch && categoryMatch && brandMatch && priceMatch;
    });

    applySort();
    renderProducts();
  }

  sortSelect?.addEventListener("change", applyFilters);
  searchInput?.addEventListener("input", applyFilters);
  document
    .querySelectorAll(".category-filter, .brand-filter")
    .forEach((el) => el.addEventListener("change", applyFilters));
  priceRange?.addEventListener("input", applyFilters);

  document.getElementById("resetFilters")?.addEventListener("click", () => {
    document
      .querySelectorAll(".category-filter, .brand-filter")
      .forEach((el) => (el.checked = false));
    if (priceRange) priceRange.value = priceRange.max;
    applyFilters();
  });

  document
    .getElementById("resetFiltersMobile")
    ?.addEventListener("click", () => {
      document
        .querySelectorAll(".category-filter, .brand-filter")
        .forEach((el) => (el.checked = false));
      if (priceRange) priceRange.value = priceRange.max;
      applyFilters();
    });

  //  Product click behavior (save product & open details)

  function saveProductAndOpen(productEl) {
    const data = {
      id:
        productEl.dataset.id ||
        productEl.querySelector("button[data-id]")?.dataset.id ||
        Date.now(),
      title:
        productEl.dataset.title ||
        productEl.querySelector("h6")?.textContent?.trim() ||
        "Product",
      price: parseFloat(productEl.dataset.price) || 0,
      brand: productEl.dataset.brand || "",
      category: productEl.dataset.category || "",
      image:
        productEl.dataset.image || productEl.querySelector("img")?.src || "",
    };
    localStorage.setItem("selectedProduct", JSON.stringify(data));
    window.location.href = "product-details-page.html";
  }

  allProducts.forEach((product) => {
    product.addEventListener("click", (e) => {
      // if user clicked an "action" button, don't open product details
      const clickedBtn = e.target.closest("button, a");
      if (
        clickedBtn &&
        (clickedBtn.classList.contains("add-to-cart") ||
          clickedBtn.classList.contains("btn-sm") ||
          clickedBtn.classList.contains("add-to-wishlist"))
      ) {
        return;
      }
      saveProductAndOpen(product);
    });
  });

  function productDataFromElement(el) {
    return {
      id: el.dataset.id || el.getAttribute("data-id") || Date.now().toString(),
      title:
        el.dataset.title ||
        el.getAttribute("data-title") ||
        (el.querySelector && el.querySelector("h6")?.textContent?.trim()) ||
        "Product",
      price:
        parseFloat(
          el.dataset.price ||
          el.getAttribute("data-price") ||
          (el.querySelector &&
            el
              .querySelector(".price")
              ?.textContent?.replace(/[^\d.]/g, "")) ||
          0
        ) || 0,
      brand: el.dataset.brand || el.getAttribute("data-brand") || "",
      category: el.dataset.category || el.getAttribute("data-category") || "",
      image:
        el.dataset.image ||
        el.getAttribute("data-image") ||
        (el.querySelector && el.querySelector("img")?.src) ||
        "",
    };
  }

  // attach delegated handlers to productList so dynamically moved nodes still work
  if (productList) {
    productList.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".add-to-cart");
      const wishBtn = e.target.closest(".add-to-wishlist");

      if (addBtn) {
        e.preventDefault();
        // try to find parent .product element
        const productEl = addBtn.closest(".product");
        const item = productEl
          ? productDataFromElement(productEl)
          : {
            id: addBtn.dataset.id || Date.now().toString(),
            title:
              addBtn.dataset.title ||
              addBtn.getAttribute("data-title") ||
              "Product",
            price:
              parseFloat(
                addBtn.dataset.price || addBtn.getAttribute("data-price")
              ) || 0,
            image:
              addBtn.dataset.image || addBtn.getAttribute("data-image") || "",
          };
        // Add to cart
        window.cartHelpers.addToCart(item);
        // quick toast / visual feedback — simple: temporarily change text
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = "Added";
        setTimeout(() => (addBtn.innerHTML = originalText), 1000);
      }

      if (wishBtn) {
        e.preventDefault();
        const productEl = wishBtn.closest(".product");
        const item = productEl
          ? productDataFromElement(productEl)
          : {
            id: wishBtn.dataset.id || Date.now().toString(),
            title:
              wishBtn.dataset.title ||
              wishBtn.getAttribute("data-title") ||
              "Product",
            price:
              parseFloat(
                wishBtn.dataset.price || wishBtn.getAttribute("data-price")
              ) || 0,
            image:
              wishBtn.dataset.image ||
              wishBtn.getAttribute("data-image") ||
              "",
          };
        window.wishlistHelpers.addToWishlist(item);
        const originalText = wishBtn.innerHTML;
        wishBtn.innerHTML = "Saved";
        setTimeout(() => (wishBtn.innerHTML = originalText), 1000);
      }
    });
  }

  const navCurrentPage =
    window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    // smooth transition
    link.style.transition = "color 0.2s, font-weight 0.2s";

    // derive filename from href (handle absolute/relative)
    let linkPage;
    try {
      linkPage = new URL(rawHref, window.location.origin).pathname
        .split("/")
        .pop();
    } catch {
      linkPage = (rawHref.split("/").pop() || rawHref)
        .split("?")[0]
        .split("#")[0];
    }
    if (linkPage === navCurrentPage)
      link.classList.add("active", "text-primary", "fw-bold");

    // hover
    link.addEventListener("mouseenter", () =>
      link.classList.add("text-primary", "fw-bold")
    );
    link.addEventListener("mouseleave", () => {
      if (!link.classList.contains("active"))
        link.classList.remove("text-primary", "fw-bold");
    });

    link.addEventListener("click", (e) => {
      // Search modal
      if (link.id === "searchBtn") {
        e.preventDefault();
        const searchModalEl = document.getElementById("searchModal");
        if (searchModalEl) {
          const searchModal = new bootstrap.Modal(searchModalEl);
          searchModal.show();
          searchModalEl.addEventListener(
            "shown.bs.modal",
            () => {
              const input = searchModalEl.querySelector(
                'input[type="text"], input[autofocus]'
              );
              if (input) input.focus();
            },
            { once: true }
          );
        }
        return;
      }

      // normal nav
      if (rawHref && rawHref !== "#") {
        e.preventDefault();
        navLinks.forEach((l) =>
          l.classList.remove("active", "text-primary", "fw-bold")
        );
        link.classList.add("active", "text-primary", "fw-bold");

        const icon = link.querySelector("i");
        if (icon) {
          icon.style.transition = "transform 0.15s";
          icon.style.transform = "scale(1.25)";
          setTimeout(() => {
            icon.style.transform = "scale(1)";
          }, 150);
        }

        setTimeout(() => {
          window.location.href = rawHref;
        }, 150);
      }
    });
  });

  applyFilters();
  updateBadges();

  window.removeCartItemById = function (id) {
    const arr = parseLS(CART_LS_KEY).filter((i) => String(i.id) !== String(id));
    writeLS(CART_LS_KEY, arr);
    updateBadges();
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: { count: getTotalQuantity(CART_LS_KEY) } })
    );
  };
  window.removeWishlistItemById = function (id) {
    const arr = parseLS(WISHLIST_LS_KEY).filter(
      (i) => String(i.id) !== String(id)
    );
    writeLS(WISHLIST_LS_KEY, arr);
    updateBadges();
    window.dispatchEvent(
      new CustomEvent("wishlist-updated", { detail: { count: arr.length } })
    );
  };

}); // DOMContentLoaded
