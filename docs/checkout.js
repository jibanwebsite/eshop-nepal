// ===============================
// Checkout Page Logic (Static Order Summary)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const orderSummary = document.getElementById("orderSummary");
    const subtotalAmount = document.getElementById("subtotalAmount");
    const shippingAmount = document.getElementById("shippingAmount");
    const taxAmount = document.getElementById("taxAmount");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const promoMessage = document.getElementById("promoMessage");
    const promoInput = document.getElementById("promoCode");
    const applyPromoBtn = document.getElementById("applyPromo");
    const cardDetails = document.getElementById("cardDetails");
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');

    const shipping = 100;
    let discount = 0;

    const CART_LS_KEY = "cartItems";
    let cart = JSON.parse(localStorage.getItem(CART_LS_KEY)) || JSON.parse(localStorage.getItem("cart")) || [];

    function renderCart() {
        orderSummary.innerHTML = "";
        if (cart.length === 0) {
            orderSummary.innerHTML = `<p class="text-center text-muted">🛒 Your cart is empty.</p>`;
            updateTotals();
            return;
        }

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            const itemDiv = document.createElement("div");
            itemDiv.className = "d-flex align-items-center border rounded p-2";

            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="me-3" style="width:60px;height:60px;object-fit:cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.title}</h6>
                    <p class="mb-1 text-muted">Brand: ${item.brand || "N/A"} | Size: ${item.size || "Default"}</p>
                    <p class="mb-1 fw-semibold">Quantity: ${item.quantity}</p>
                </div>
                <span class="fw-semibold ms-2">NRS.${itemSubtotal.toLocaleString()}</span>
            `;

            orderSummary.appendChild(itemDiv);
        });

        updateTotals();
    }

    function updateTotals() {
        const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const tax = (subtotal - discount + shipping) * 0.13;
        subtotalAmount.textContent = `NRS.${subtotal.toLocaleString()}`;
        shippingAmount.textContent = `NRS.${shipping.toLocaleString()}`;
        taxAmount.textContent = `NRS.${tax.toLocaleString()}`;
        checkoutTotal.textContent = `NRS.${(subtotal - discount + shipping + tax).toLocaleString()}`;
    }

    // Promo Code
    applyPromoBtn.addEventListener("click", () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === "MEROPASAL10") {
            discount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0) * 0.10;
            promoMessage.textContent = "Promo code applied! 10% discount";
        } else {
            discount = 0;
            promoMessage.textContent = "Invalid promo code";
        }
        updateTotals();
    });

    // Payment method toggle
    function toggleCardDetails() {
        const selected = document.querySelector('input[name="paymentMethod"]:checked').value;
        cardDetails.style.display = selected === "Credit Card" ? "block" : "none";
    }
    toggleCardDetails();
    paymentRadios.forEach(r => r.addEventListener("change", toggleCardDetails));

    // Checkout form submit
    document.getElementById("checkoutForm").addEventListener("submit", (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        const order = {
            cart,
            subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
            shipping,
            discount,
            tax: (cart.reduce((sum, i) => sum + i.price * i.quantity, 0) - discount + shipping) * 0.13,
            total: parseFloat(checkoutTotal.textContent.replace(/NRS\./, ""))
        };
        localStorage.setItem("lastOrder", JSON.stringify(order));
        // remove unified cart key and legacy key if present
        localStorage.removeItem(CART_LS_KEY);
        localStorage.removeItem("cart");
        try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: 0 } })); } catch (e) { }
        alert("Order placed successfully!");
        window.location.href = "order-completed.html";
    });

    renderCart();
});
