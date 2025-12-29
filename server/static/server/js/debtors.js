// server/static/server/js/debtors.js

let selectedLoanProducts = [];
let allAvailableProducts = [];

window.renderDebtors = function () {
  const debtors = window.serverDebtors || [];
  const content = document.getElementById("debtorsContent");
  if (!content) return;

  const unpaidDebtors = debtors.filter((d) => !d.paid);
  const paidDebtors = debtors.filter((d) => d.paid);

  let totalDebt = 0;
  unpaidDebtors.forEach((d) => (totalDebt += parseFloat(d.amount_owed)));

  let html = `
    <div class="add-debtor-section">
      <h3>➕ Add New Debtor</h3>
      <div class="add-debtor-form">
        <input type="text" id="debtorCustomerName" placeholder="Customer Name" class="form-input">
        <button class="btn-add" id="btnShowProductSelector">
          <span>🛒</span> Select Products to Loan
        </button>
      </div>
      
      <div id="productSelector" class="product-selector" style="display: none;">
        <h4>Select Products</h4>
        <div class="product-search-bar">
          <input type="text" id="productSearchInput" placeholder="🔍 Search products..." class="search-input">
          <button class="btn-clear-search" id="btnClearSearch" style="display: none;">✕</button>
        </div>
        <div id="productList" class="product-selection-list"></div>
        <div class="loan-summary">
          <div class="loan-total">Total Loan Amount: ₱<span id="loanTotal">0.00</span></div>
          <button class="btn-add" id="btnAddDebtor">Add Debtor</button>
          <button class="btn-cancel" id="btnCancelDebtor">Cancel</button>
        </div>
      </div>
    </div>

    <hr style="margin: 30px 0; border: 2px solid var(--primary); opacity: 0.3;">

    <div class="debtors-summary">
      <div class="debt-card">
        <h3>Total Outstanding Debt</h3>
        <div class="debt-amount">₱${totalDebt.toFixed(2)}</div>
      </div>
      <div class="debt-card">
        <h3>Unpaid Debtors</h3>
        <div class="debt-amount">${unpaidDebtors.length}</div>
      </div>
      <div class="debt-card">
        <h3>Paid Debtors</h3>
        <div class="debt-amount">${paidDebtors.length}</div>
      </div>
    </div>

    <h3>📋 Unpaid Debts</h3>
    ${renderDebtorsList(unpaidDebtors, false)}

    <h3 style="margin-top: 30px;">✅ Paid Debts</h3>
    ${renderDebtorsList(paidDebtors, true)}
  `;

  content.innerHTML = html;

  setupDebtorEventListeners();
};

function setupDebtorEventListeners() {
  const btnShowSelector = document.getElementById("btnShowProductSelector");
  if (btnShowSelector) {
    btnShowSelector.addEventListener("click", showProductSelector);
  }

  const btnAddDebtor = document.getElementById("btnAddDebtor");
  if (btnAddDebtor) {
    btnAddDebtor.addEventListener("click", addDebtor);
  }

  const btnCancelDebtor = document.getElementById("btnCancelDebtor");
  if (btnCancelDebtor) {
    btnCancelDebtor.addEventListener("click", () => {
      document.getElementById("productSelector").style.display = "none";
      document.getElementById("debtorCustomerName").value = "";
      selectedLoanProducts = [];
    });
  }

  const productSearchInput = document.getElementById("productSearchInput");
  if (productSearchInput) {
    productSearchInput.addEventListener("input", filterProducts);
    productSearchInput.addEventListener("keyup", (e) => {
      const btnClear = document.getElementById("btnClearSearch");
      if (e.target.value.trim()) {
        btnClear.style.display = "block";
      } else {
        btnClear.style.display = "none";
      }
    });
  }

  const btnClearSearch = document.getElementById("btnClearSearch");
  if (btnClearSearch) {
    btnClearSearch.addEventListener("click", clearProductSearch);
  }

  document.querySelectorAll(".btn-mark-paid").forEach((btn) => {
    btn.addEventListener("click", function () {
      const debtorId = parseInt(this.getAttribute("data-debtor-id"));
      markAsPaid(debtorId);
    });
  });

  document.querySelectorAll(".btn-delete-debtor").forEach((btn) => {
    btn.addEventListener("click", function () {
      const debtorId = parseInt(this.getAttribute("data-debtor-id"));
      deleteDebtor(debtorId);
    });
  });
}

function showProductSelector() {
  const customerNameInput = document.getElementById("debtorCustomerName");
  const customerName = customerNameInput.value.trim();

  if (!customerName) {
    alert("⚠️ Please enter customer name first!");
    customerNameInput.focus();
    return;
  }

  const products = (window.serverProducts || []).filter(
    (p) => parseInt(p.quantity) > 0
  );

  if (products.length === 0) {
    alert("⚠️ No products available in inventory!");
    return;
  }

  window.allAvailableProducts = products;
  renderProductSelectorList(products);

  const selector = document.getElementById("productSelector");
  const searchInput = document.getElementById("productSearchInput");
  const clearBtn = document.getElementById("btnClearSearch");

  selector.style.display = "block";

  if (searchInput) {
    searchInput.value = "";
    setTimeout(() => searchInput.focus(), 100);
  }

  if (clearBtn) {
    clearBtn.style.display = "none";
  }
}

function renderProductSelectorList(products) {
  const productList = document.getElementById("productList");
  let html = "";

  if (products.length === 0) {
    html =
      '<div class="no-products-found">No products found. Try a different search.</div>';
  } else {
    products.forEach((product) => {
      const currentQty =
        selectedLoanProducts.find((p) => p.id === product.id)?.quantity || 0;

      const priceValue = parseFloat(product.price || 0);

      html += `
        <div class="product-loan-item" data-product-name="${product.name.toLowerCase()}">
          <div class="product-loan-info">
            <strong>${product.name}</strong>
            <span class="product-loan-price">₱${priceValue.toFixed(
              2
            )} each</span>
            <span class="product-loan-stock">${
              product.quantity
            } available</span>
          </div>
          <div class="product-loan-controls">
            <button class="btn-qty-small" onclick="decrementLoanQty(${
              product.id
            })">−</button>
            <input type="number" 
                  id="loanQty_${product.id}" 
                  value="${currentQty}" 
                  min="0" 
                  max="${product.quantity}"
                  class="qty-input-small"
                  onchange="updateLoanQty(${product.id}, this.value)">
            <button class="btn-qty-small" onclick="incrementLoanQty(${
              product.id
            }, ${product.quantity})">+</button>
          </div>
        </div>
      `;
    });
  }

  productList.innerHTML = html;
}

function filterProducts() {
  const searchTerm = document
    .getElementById("productSearchInput")
    .value.toLowerCase()
    .trim();

  if (!searchTerm) {
    renderProductSelectorList(allAvailableProducts);
    return;
  }

  const filteredProducts = allAvailableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );

  renderProductSelectorList(filteredProducts);
}

function clearProductSearch() {
  document.getElementById("productSearchInput").value = "";
  document.getElementById("btnClearSearch").style.display = "none";
  renderProductSelectorList(allAvailableProducts);
  document.getElementById("productSearchInput").focus();
}

window.incrementLoanQty = function (productId, maxQty) {
  const input = document.getElementById(`loanQty_${productId}`);
  let currentQty = parseInt(input.value) || 0;
  if (currentQty < maxQty) {
    input.value = currentQty + 1;
    updateLoanQty(productId, input.value);
  } else {
    alert("⚠️ Cannot exceed available stock!");
  }
};

window.decrementLoanQty = function (productId) {
  const input = document.getElementById(`loanQty_${productId}`);
  let currentQty = parseInt(input.value) || 0;
  if (currentQty > 0) {
    input.value = currentQty - 1;
    updateLoanQty(productId, input.value);
  }
};

window.updateLoanQty = function (productId, qty) {
  const quantity = parseInt(qty) || 0;
  const product = (window.serverProducts || []).find((p) => p.id === productId);

  if (!product) return;

  if (quantity > parseInt(product.quantity)) {
    alert(
      `⚠️ Cannot exceed available stock! (${product.quantity} units available)`
    );
    const qtyInput = document.getElementById(`loanQty_${productId}`);
    if (qtyInput) qtyInput.value = product.quantity;
    return;
  }

  const existingIndex = selectedLoanProducts.findIndex(
    (p) => p.id === productId
  );

  if (quantity > 0) {
    if (existingIndex >= 0) {
      selectedLoanProducts[existingIndex].quantity = quantity;
    } else {
      selectedLoanProducts.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        cost: parseFloat(product.cost),
        quantity: quantity,
      });
    }
  } else {
    if (existingIndex >= 0) {
      selectedLoanProducts.splice(existingIndex, 1);
    }
  }
  updateLoanTotal();
};

function updateLoanTotal() {
  let total = 0;
  selectedLoanProducts.forEach((p) => {
    total += p.price * p.quantity;
  });

  document.getElementById("loanTotal").textContent = total.toFixed(2);
}

function addDebtor() {
  const nameInput = document.getElementById("debtorCustomerName");
  const name = nameInput.value.trim();

  if (!name) {
    alert("⚠️ Please enter customer name!");
    nameInput.focus();
    return;
  }

  if (selectedLoanProducts.length === 0) {
    alert("⚠️ Please select at least one product!");
    return;
  }

  let totalAmount = 0;
  selectedLoanProducts.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  const now = new Date();
  const dateTime = now.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const itemsSummary = selectedLoanProducts
    .map((p) => `${p.name} (${p.quantity})`)
    .join(", ");

  const confirmMessage =
    `Add debtor with the following details?\n\n` +
    `Customer: ${name}\n` +
    `Items: ${itemsSummary}\n` +
    `Total Amount: ₱${totalAmount.toFixed(2)}\n` +
    `Date: ${dateTime}`;

  if (!confirm(confirmMessage)) return;

  fetch("/process-sale/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({
      cart: selectedLoanProducts,
      payment_type: "credit",
      customer_name: name,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        alert(
          `✓ Debtor "${name}" added successfully!\nLoan Amount: ₱${totalAmount.toFixed(
            2
          )}`
        );

        nameInput.value = "";
        const selector = document.getElementById("productSelector");
        if (selector) selector.style.display = "none";
        selectedLoanProducts = [];
        document.getElementById("loanTotal").textContent = "0.00";

        if (data.updated_debtors) {
          window.serverDebtors = data.updated_debtors;
        }

        if (data.updated_products) {
          window.serverProducts = data.updated_products;
          window.allAvailableProducts = data.updated_products;
        }

        window.renderDebtors();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("❌ Network error. Failed to add debtor.");
    });
}

function renderDebtorsList(debtors, isPaid) {
  if (debtors.length === 0) {
    return (
      '<p class="no-data">No ' + (isPaid ? "paid" : "unpaid") + " debts.</p>"
    );
  }

  let html =
    '<table class="debtors-table"><thead><tr><th>Customer Name</th><th>Date & Time</th><th>Items</th><th>Amount</th>';

  if (!isPaid) {
    html += "<th>Actions</th>";
  } else {
    html += "<th>Status</th>";
  }

  html += "</tr></thead><tbody>";

  debtors.forEach((debtor) => {
    const date = new Date(debtor.date_added || debtor.date);
    const amountValue = parseFloat(debtor.amount_owed || debtor.amount || 0);

    const itemsList = Array.isArray(debtor.items)
      ? debtor.items.map((i) => `${i.name} (${i.quantity})`).join(", ")
      : "No items recorded";

    const rowClass = isPaid ? "paid-row" : "unpaid-row";

    html += `
      <tr class="${rowClass}">
        <td><strong>${debtor.name}</strong></td>
        <td>${date.toLocaleString()}</td>
        <td>${itemsList}</td>
        <td class="debt-amount-cell">₱${amountValue.toFixed(2)}</td>
    `;

    if (!isPaid) {
      html += `
        <td>
          <button class="btn-pay btn-mark-paid" data-debtor-id="${debtor.id}">💰 Mark as Paid</button>
          <button class="btn-delete btn-delete-debtor" data-debtor-id="${debtor.id}">🗑️ Delete</button>
        </td>
      `;
    } else {
      const pDate = debtor.paid_date || debtor.paidDate;
      const paidDateDisplay = pDate
        ? new Date(pDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";
      html += `<td><span class="paid-badge">Paid on ${paidDateDisplay}</span></td>`;
    }

    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

window.markAsPaid = function (debtorId) {
  const debtor = (window.serverDebtors || []).find((d) => d.id === debtorId);

  if (!debtor) {
    alert("⚠️ Debtor record not found!");
    return;
  }

  const confirmMessage =
    `Mark this debt as paid?\n\n` +
    `Customer: ${debtor.name}\n` +
    `Amount: ₱${parseFloat(debtor.amount_owed).toFixed(2)}\n\n` +
    `This will record the payment and move it to paid debts.`;

  if (!confirm(confirmMessage)) return;

  fetch("/mark-debt-paid/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({ id: debtorId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        alert(`✓ Debt marked as paid for "${debtor.name}"!`);

        if (data.updated_debtors) window.serverDebtors = data.updated_debtors;

        window.renderDebtors();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("❌ Network error. Failed to update status.");
    });
};

window.deleteDebtor = function (debtorId) {
  const debtor = (window.serverDebtors || []).find((d) => d.id === debtorId);

  if (!debtor) {
    alert("⚠️ Debtor record not found!");
    return;
  }

  const statusLabel = debtor.paid ? "Paid" : "Unpaid";
  const confirmMessage =
    `⚠️ Are you sure you want to delete this debt record?\n\n` +
    `Customer: ${debtor.name}\n` +
    `Amount: ₱${parseFloat(debtor.amount_owed).toFixed(2)}\n` +
    `Status: ${statusLabel}\n\n` +
    `This action cannot be undone!`;

  if (!confirm(confirmMessage)) return;

  fetch("/delete-debtor/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({ id: debtorId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "success") {
        alert(`✓ Debt record for "${debtor.name}" has been deleted.`);

        if (data.updated_debtors) window.serverDebtors = data.updated_debtors;
        if (data.updated_products) {
          window.serverProducts = data.updated_products;
          window.allAvailableProducts = data.updated_products;
        }

        window.renderDebtors();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("❌ Network error. Failed to delete record.");
    });
};

window.renderProductSelectorList = renderProductSelectorList;
window.filterProducts = filterProducts;
window.clearProductSearch = clearProductSearch;
