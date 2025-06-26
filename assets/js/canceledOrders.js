import {
  fetchAllOrdersByStatus,
  fetchOrderById,
  updateOrder,
  deleteOrder,
} from "./Orders.js";

let currentOrder = null;

function formatCurrency(amount) {
  return `GHS ${amount}`;
}

function getCustomerName(order) {
  const info = order.customerInfo || {};
  return `${info.firstName || ""} ${info.lastName || ""}`.trim();
}

function getStatusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "text-warning";
    case "completed":
      return "text-success";
    case "canceled":
      return "text-danger";
    default:
      return "";
  }
}

async function renderOrdersTable() {
  const orders = await fetchAllOrdersByStatus("Canceled");
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";
  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row"><input class="form-check-input" type="checkbox" value="${
        order.id
      }"></th>
      <td>${order.id}</td>
      <td>${getCustomerName(order)}</td>
      <td>${formatCurrency(order.totals?.total || 0)}</td>
      <td class="${getStatusClass(order.status)}">${
      order.status || "Pending"
    }</td>
      <td>
        <a href="#" class="btn btn-sm btn-info view-order-btn" data-order-id="${
          order.id
        }" data-is-guest="${order.isGuest}">View</a>
        <a href="#" class="btn btn-sm btn-danger delete-order-btn" data-order-id="${
          order.id
        }" data-is-guest="${order.isGuest}">Delete</a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function showOrderDetails(orderId, isGuest) {
  const order = await fetchOrderById(orderId, isGuest === "true");
  if (!order) return;
  order.isGuest = isGuest === "true";
  currentOrder = { id: order.id, isGuest: isGuest === "true" };
  const body = document.getElementById("orderDetailsBody");
  body.innerHTML = `
    <div class="mb-2"><span class="badge bg-${
      order.isGuest ? "warning" : "primary"
    }">Order Type: ${order.isGuest ? "Guest" : "Authenticated"}</span></div>
    <h6>Order #: ${order.id}</h6>
    <p><strong>Status:</strong> ${order.status || "Pending"}</p>
    <p><strong>Created At:</strong> ${
      order.createdAt
        ? new Date(order.createdAt.seconds * 1000).toLocaleString()
        : ""
    }</p>
    <hr>
    <h6>Customer Info</h6>
    <ul>
      <li><strong>Name:</strong> ${getCustomerName(order)}</li>
      <li><strong>Email:</strong> ${order.customerInfo?.email || ""}</li>
      <li><strong>Phone:</strong> ${order.customerInfo?.phone || ""}</li>
      <li><strong>Address:</strong> ${order.customerInfo?.address || ""}, ${
    order.customerInfo?.city || ""
  }, ${order.customerInfo?.region || ""}</li>
      <li><strong>Order Note:</strong> ${
        order.customerInfo?.orderNote || ""
      }</li>
    </ul>
    <hr>
    <h6>Items</h6>
    <ul>
      ${order.items
        ?.map(
          (item) => `
        <li>
          <img src="${
            item.featuredImage || "/assets/media/imagePlaceholder.jpg"
          }" alt="" style="width:40px;height:40px;object-fit:cover;margin-right:8px;">
          <strong>ID:</strong> ${item.id} | <strong>Qty:</strong> ${
            item.quantity
          } | <strong>Price:</strong> ${formatCurrency(item.price)}${
            item.salePrice
              ? ` | <strong>Sale:</strong> ${formatCurrency(item.salePrice)}`
              : ""
          }
        </li>
      `
        )
        .join("")}
    </ul>
    <hr>
    <h6>Totals</h6>
    <ul>
      <li><strong>Subtotal:</strong> ${formatCurrency(
        order.totals?.subtotal || 0
      )}</li>
      <li><strong>Shipping:</strong> ${formatCurrency(
        order.totals?.shipping || 0
      )}</li>
      <li><strong>Total:</strong> ${formatCurrency(
        order.totals?.total || 0
      )}</li>
    </ul>
    <p><strong>Payment Method:</strong> ${order.paymentMethod || ""}</p>
  `;
  const modal = new bootstrap.Modal(
    document.getElementById("orderDetailsModal")
  );
  modal.show();
}

function setupTableEvents() {
  document
    .getElementById("ordersTableBody")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("view-order-btn")) {
        e.preventDefault();
        const orderId = e.target.getAttribute("data-order-id");
        const isGuest = e.target.getAttribute("data-is-guest");
        showOrderDetails(orderId, isGuest);
      }
      // Delete logic can be added here if needed
    });
}

async function handleUpdateStatus(status) {
  if (!currentOrder) return;
  const { id, isGuest } = currentOrder;
  const modalInstance = bootstrap.Modal.getInstance(
    document.getElementById("orderDetailsModal")
  );
  try {
    await updateOrder(id, { status }, isGuest);
    modalInstance.hide();
    await renderOrdersTable();
  } catch (error) {
    console.error("Failed to update order status:", error);
    alert("Failed to update order status. Please try again.");
  }
}

function setupModalButtons() {
  document
    .getElementById("acceptOrderBtn")
    .addEventListener("click", () => handleUpdateStatus("Completed"));
  document
    .getElementById("cancelOrderBtn")
    .addEventListener("click", () => handleUpdateStatus("Canceled"));
}

// Initialize
renderOrdersTable();
setupTableEvents();
setupModalButtons();
