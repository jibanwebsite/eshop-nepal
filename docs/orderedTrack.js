const trackingStatus = document.getElementById('trackingStatus');
const trackingOrderId = document.getElementById('trackingOrderId');

function showTracking(orderId) {
  trackingStatus.classList.remove('d-none');
  trackingOrderId.textContent = orderId;

  // Example: dynamically set completed steps based on order status
  const steps = trackingStatus.querySelectorAll('.tracking-step');
  steps.forEach(step => step.classList.remove('completed'));

  // Mock logic for demo
  if (orderId === '1001') {
    steps.forEach(step => step.classList.add('completed')); // Delivered
  } else if (orderId === '1002') {
    steps[0].classList.add('completed'); // Placed
    steps[1].classList.add('completed'); // Confirmed
    steps[2].classList.add('completed'); // Shipped
  } else if (orderId === '1003') {
    steps[0].classList.add('completed'); // Placed
    steps[1].classList.add('completed'); // Confirmed
  }
}

// Function to generate invoice PDF
function downloadInvoicePDF(orderId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Example order details
  const orderDetails = {
    orderId: orderId,
    date: new Date().toLocaleDateString(),
    customer: "Jiban Budhathoki",
    items: [
      { name: "Product 1", qty: 2, price: 999 },
      { name: "Product 2", qty: 1, price: 1200 },
      { name: "Product 3", qty: 1, price: 1500 },
    ]
  };

  let total = orderDetails.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  // Header
  doc.setFontSize(18);
  doc.text("Mero Pasal - Invoice", 105, 20, { align: "center" });

  // Order Info
  doc.setFontSize(12);
  doc.text(`Order ID: ${orderDetails.orderId}`, 20, 40);
  doc.text(`Date: ${orderDetails.date}`, 20, 50);
  doc.text(`Customer: ${orderDetails.customer}`, 20, 60);

  // Table Headers
  doc.text("Item", 20, 80);
  doc.text("Qty", 120, 80);
  doc.text("Price", 150, 80);

  // Items
  let yPos = 90;
  orderDetails.items.forEach(item => {
    doc.text(item.name, 20, yPos);
    doc.text(String(item.qty), 120, yPos);
    doc.text(`NRS.${item.price}`, 150, yPos);
    yPos += 10;
  });

  // Total
  doc.setFontSize(14);
  doc.text(`Total: NRS.${total}`, 20, yPos + 10);

  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for shopping with Mero Pasal!", 105, yPos + 30, { align: "center" });

  // Save PDF
  doc.save(`Invoice_${orderDetails.orderId}.pdf`);
}


// order completed function 
const completedOrders = [
  { id: '1001', date: '2025-09-10', items: 3, total: 3500, status: 'Delivered', payment: 'Credit Card (VISA)' },
  { id: '1002', date: '2025-09-11', items: 1, total: 1200, status: 'Delivered', payment: 'PayPal' },
  { id: '1003', date: '2025-09-12', items: 2, total: 2200, status: 'Delivered', payment: 'eSewa' }
];

const orderDetailsDiv = document.getElementById('orderDetails');

// Get last order from localStorage or default to last completed order
let lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
if (!lastOrder) {
  lastOrder = completedOrders[completedOrders.length - 1];
  localStorage.setItem('lastOrder', JSON.stringify(lastOrder));
}

// Ensure consistent key
if (!lastOrder.id && lastOrder.orderId) lastOrder.id = lastOrder.orderId;

// Display order details dynamically
orderDetailsDiv.innerHTML = `
    <p class="mb-1"><strong>Order ID:</strong> ${lastOrder.id}</p>
    <p class="mb-1"><strong>Date:</strong> ${lastOrder.date}</p>
    <p class="mb-1"><strong>Total:</strong> NRS.${lastOrder.total.toFixed(2)}</p>
    <p class="mb-0"><strong>Payment Method:</strong> ${lastOrder.payment}</p>
`;

// Optional: Clear cart after successful order
// Clear both legacy and unified cart keys
localStorage.removeItem('cartItems');
localStorage.removeItem('cart');
try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: 0 } })); } catch (e) { }