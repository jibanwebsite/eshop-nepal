document.addEventListener("DOMContentLoaded", () => {
    const wishlistTableBody = document.getElementById('wishlistTableBody');
    const wishlistCards = document.getElementById('wishlistCards');
    const wishlistTotalEl = document.getElementById('wishlistTotal');

    // Load wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem("wishlistItems")) || [];

    function saveWishlist() {
        localStorage.setItem("wishlistItems", JSON.stringify(wishlist));
        if (window.updateBadges) updateBadges(); // Update bottom nav badge
    }

    function renderWishlist() {
        wishlistTableBody.innerHTML = '';
        wishlistCards.innerHTML = '';
        let total = 0;

        if (wishlist.length === 0) {
            wishlistTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">❤️ Your wishlist is empty.</td></tr>`;
            wishlistCards.innerHTML = `<p class="text-center text-muted">❤️ Your wishlist is empty.</p>`;
            wishlistTotalEl.textContent = `NRS.0`;
            return;
        }

        wishlist.forEach(item => {
            total += item.price;

            // Desktop Table
            wishlistTableBody.innerHTML += `
                <tr>
                    <td><img src="${item.img}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;margin-right:8px;"> ${item.name}</td>
                    <td>NRS.${item.price.toLocaleString()}</td>
                    <td>${item.stock}</td>
                    <td>
                        <button class="btn btn-sm btn-success me-1" onclick="addToCart(${item.id})">
                            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="removeFromWishlist(${item.id})">
                            <i class="fa-solid fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;

            // Mobile Cards
            wishlistCards.innerHTML += `
                <div class="col">
                    <div class="card h-100">
                        <img src="${item.img}" class="card-img-top" alt="${item.name}">
                        <div class="card-body">
                            <h6 class="card-title">${item.name}</h6>
                            <p class="card-text text-danger fw-bold">NRS.${item.price.toLocaleString()}</p>
                            <p class="card-text">${item.stock}</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-success flex-fill" onclick="addToCart(${item.id})">
                                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                                </button>
                                <button class="btn btn-sm btn-danger flex-fill" onclick="removeFromWishlist(${item.id})">
                                    <i class="fa-solid fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        wishlistTotalEl.textContent = `NRS.${total.toLocaleString()}`;
    }

    window.removeFromWishlist = function(id) {
        wishlist = wishlist.filter(item => item.id !== id);
        saveWishlist();
        renderWishlist();
    };

    window.addToCart = function(id) {
        const item = wishlist.find(i => i.id === id);
        if (item) {
            window.cartHelpers.addToCart({ ...item, quantity: 1 });
            alert(`${item.name} added to cart!`);
        }
    };

    window.clearWishlist = function() {
        if (confirm("Are you sure you want to clear your entire wishlist?")) {
            wishlist = [];
            saveWishlist();
            renderWishlist();
        }
    };

    // --- Dynamic add to wishlist from product page ---
    if (window.wishlistHelpers) {
        document.querySelectorAll(".add-to-wishlist").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const productEl = btn.closest(".product");
                if (!productEl) return;

                const item = {
                    id: productEl.dataset.id || Date.now(),
                    name: productEl.dataset.title || productEl.querySelector("h6")?.textContent || "Product",
                    price: parseFloat(productEl.dataset.price) || 0,
                    stock: productEl.dataset.stock || "In Stock",
                    img: productEl.dataset.image || productEl.querySelector("img")?.src || ""
                };

                // Avoid duplicates
                if (!wishlist.some(w => w.id === item.id)) {
                    wishlist.push(item);
                    saveWishlist();
                    renderWishlist();
                    alert(`${item.name} added to wishlist!`);
                } else {
                    alert(`${item.name} is already in your wishlist!`);
                }
            });
        });
    }

    renderWishlist();

    window.addToCart = function(id) {
    const item = wishlist.find(i => i.id === id);
    if (item) {
        // Map wishlist item fields to cart item structure
        const cartItem = {
            id: item.id.toString(),
            title: item.name,
            price: item.price,
            brand: item.brand || "N/A",
            category: item.category || "Misc",
            image: item.img,
            quantity: 1
        };

        window.cartHelpers.addToCart(cartItem);
        alert(`${item.name} added to cart!`);
    }
};
});
