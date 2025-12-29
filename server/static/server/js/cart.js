// server/static/server/js/cart.js

let cart = [];

window.addToCart = function (productId) {
  const product = (window.serverProducts || []).find((p) => p.id === productId);
  if (!product || parseInt(product.quantity) === 0) {
    alert("⚠️ Product not available!");
    return;
  }

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    const qtyInput = document.querySelector(
      `input[data-cart-id="${productId}"]`
    );
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
    return;
  }

  cart.push({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    cost: parseFloat(product.cost),
    quantity: 1,
  });

  updateCartDisplay();

  setTimeout(() => {
    const qtyInput = document.querySelector(
      `input[data-cart-id="${productId}"]`
    );
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }, 100);
};

window.removeFromCart = function (productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartDisplay();
  handleSearch();
};

window.updateCartQuantity = function (productId, change) {
  const item = cart.find((item) => item.id === productId);
  const product = (window.serverProducts || []).find((p) => p.id === productId);

  if (!item || !product) return;

  const newQty = item.quantity + change;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQty > parseInt(product.quantity)) {
    alert("⚠️ Not enough stock! Only " + product.quantity + " available.");
    return;
  }

  item.quantity = newQty;
  updateCartDisplay();
  handleSearch();
};

window.setCartQuantity = function (productId, quantity) {
  const item = cart.find((item) => item.id === productId);
  const product = (window.serverProducts || []).find((p) => p.id === productId);

  if (!item || !product) return;

  const qty = parseInt(quantity);

  if (isNaN(qty) || qty < 0) {
    alert("⚠️ Invalid quantity!");
    updateCartDisplay();
    return;
  }

  if (qty === 0) {
    removeFromCart(productId);
    return;
  }

  if (qty > parseInt(product.quantity)) {
    alert("⚠️ Not enough stock! Only " + product.quantity + " available.");
    item.quantity = parseInt(product.quantity);
    updateCartDisplay();
    return;
  }

  item.quantity = qty;
  updateCartDisplay();
  handleSearch();
};

window.clearCart = function () {
  if (cart.length === 0) return;
  if (confirm("🗑️ Clear all items from cart?")) {
    cart = [];
    updateCartDisplay();
    handleSearch();
  }
};

window.updateCartDisplay = function () {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-cart">🛒 Cart is empty<br><small>Search and click products to add</small></p>';
    cartTotal.textContent = "0.00";
    cartCount.textContent = "0";
    cartCount.style.display = "none";
    return;
  }

  let total = 0;
  let itemCount = 0;
  let html =
    '<div class="cart-list-header"><strong>Items in Cart:</strong></div><div class="cart-list">';

  cart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    itemCount += item.quantity;

    html += `
      <div class="cart-item">
        <div class="cart-item-header">
          <strong class="cart-item-name">${item.name}</strong>
          <button class="btn-remove-mini btn-cart-remove" data-product-id="${
            item.id
          }" title="Remove">✕</button>
        </div>
        <div class="cart-item-details">
          <span class="cart-item-price">₱${item.price.toFixed(2)} each</span>
        </div>
        <div class="cart-item-controls">
          <button class="btn-qty-round btn-qty-minus" data-product-id="${
            item.id
          }" title="Decrease">−</button>
          <input type="number" 
                value="${item.quantity}"
                min="1"
                class="qty-input-cart"
                data-cart-id="${item.id}"
                title="Click to edit quantity">
          <button class="btn-qty-round btn-qty-plus" data-product-id="${
            item.id
          }" title="Increase">+</button>
        </div>
        <div class="cart-item-subtotal">
          <span class="subtotal-label">Subtotal:</span>
          <span class="subtotal-amount">₱${subtotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  });

  html += "</div>";

  html +=
    '<button class="btn-clear-cart" onclick="clearCart()">🗑️ Clear All</button>';

  cartItems.innerHTML = html;
  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = itemCount;
  cartCount.style.display = "flex";

  document.querySelectorAll(".btn-qty-minus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      updateCartQuantity(productId, -1);
    });
  });

  document.querySelectorAll(".btn-qty-plus").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      updateCartQuantity(productId, 1);
    });
  });

  document.querySelectorAll(".btn-cart-remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      removeFromCart(productId);
    });
  });

  document.querySelectorAll(".qty-input-cart").forEach((input) => {
    input.addEventListener("change", function () {
      const productId = parseInt(this.getAttribute("data-cart-id"));
      setCartQuantity(productId, this.value);
    });
    input.addEventListener("focus", function () {
      this.select();
    });
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        this.blur();
      }
    });
  });
};

window.handleCheckout = function () {
  if (cart.length === 0) {
    alert("⚠️ Cart is empty! Add some products first.");
    return;
  }

  let totalAmount = 0;
  let totalProfit = 0;
  cart.forEach((item) => {
    totalAmount += item.price * item.quantity;
    totalProfit += (item.price - item.cost) * item.quantity;
  });

  const itemsList = cart
    .map((item) => `${item.name} (${item.quantity})`)
    .join(", ");

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    </style>
    <div style="
      background: linear-gradient(135deg, #ffffff, #f8f9fa);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 4px solid var(--primary);
      animation: slideUp 0.4s ease;
      text-align: center;
    ">
      <h2 style="color: var(--accent); margin-bottom: 20px; font-size: 28px;">💰 Checkout</h2>
      <div style="
        color: #666;
        font-size: 14px;
        line-height: 1.6;
        margin: 15px 0;
        max-height: 100px;
        overflow-y: auto;
        padding: 10px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 8px;
      ">
        <strong>Items:</strong> ${itemsList}
      </div>
      <div style="
        background: linear-gradient(135deg, #fff9e6, #ffffff);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 2px solid var(--primary);
      ">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
          <strong style="color: var(--brown);">Subtotal:</strong>
          <span>₱${totalAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
          <strong style="color: var(--brown);">Profit:</strong>
          <span style="color: var(--green);">₱${totalProfit.toFixed(2)}</span>
        </div>
        <div style="
          font-size: 24px;
          font-weight: 800;
          color: var(--accent);
          border-top: 2px solid var(--primary);
          padding-top: 15px;
          margin-top: 10px;
        ">
          Total: ₱${totalAmount.toFixed(2)}
        </div>
      </div>
      <p style="color: #666; font-size: 14px; margin: 20px 0;">Select payment method:</p>
      <div style="display: flex; gap: 15px; margin-top: 30px;">
        <button id="btnPayCash" style="
          flex: 1;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          background: linear-gradient(135deg, #4CAF50, #66BB6A);
          color: white;
        ">
          💵 Cash
        </button>
        <button id="btnPayCredit" style="
          flex: 1;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          background: linear-gradient(135deg, #FF9800, #FFB74D);
          color: white;
        ">
          📝 Credit (Utang)
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const btnCash = document.getElementById("btnPayCash");
  const btnCredit = document.getElementById("btnPayCredit");

  btnCash.addEventListener("mouseenter", () => {
    btnCash.style.background = "linear-gradient(135deg, #2E7D32, #43A047)";
    btnCash.style.transform = "translateY(-3px)";
  });
  btnCash.addEventListener("mouseleave", () => {
    btnCash.style.background = "linear-gradient(135deg, #4CAF50, #66BB6A)";
    btnCash.style.transform = "translateY(0)";
  });

  btnCredit.addEventListener("mouseenter", () => {
    btnCredit.style.background = "linear-gradient(135deg, #F57C00, #FF9800)";
    btnCredit.style.transform = "translateY(-3px)";
  });
  btnCredit.addEventListener("mouseleave", () => {
    btnCredit.style.background = "linear-gradient(135deg, #FF9800, #FFB74D)";
    btnCredit.style.transform = "translateY(0)";
  });

  btnCash.addEventListener("click", () => {
    document.body.removeChild(modal);
    showCashPaymentModal(totalAmount, totalProfit);
  });

  btnCredit.addEventListener("click", () => {
    document.body.removeChild(modal);
    showCustomerNameModal(totalAmount);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
};

function showCashPaymentModal(totalAmount, totalProfit) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #ffffff, #f8f9fa);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 4px solid var(--primary);
      animation: slideUp 0.4s ease;
      text-align: center;
    ">
      <h2 style="color: var(--accent); margin-bottom: 20px; font-size: 28px;">💵 Cash Payment</h2>
      
      <div style="
        background: linear-gradient(135deg, #fff9e6, #ffffff);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 2px solid var(--primary);
      ">
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px;">
          <strong style="color: var(--brown);">Total Amount:</strong>
          <span style="font-size: 24px; font-weight: 800; color: var(--accent);">₱${totalAmount.toFixed(
            2
          )}</span>
        </div>
      </div>

      <p style="color: #666; font-size: 14px; margin: 20px 0;">Enter amount paid by customer:</p>
      <input type="number" 
            id="amountPaidInput" 
            placeholder="0.00"
            step="0.01"
            min="0"
            style="
              width: 100%;
              padding: 20px;
              border: 3px solid var(--primary);
              border-radius: 10px;
              font-size: 24px;
              font-weight: 700;
              text-align: center;
              margin: 20px 0;
              box-sizing: border-box;
              color: var(--brown);
            ">

      <div id="changeDisplay" style="
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 3px solid var(--green);
        display: none;
      ">
        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Change:</div>
        <div id="changeAmount" style="font-size: 36px; font-weight: 800; color: var(--green);">₱0.00</div>
      </div>

      <div id="insufficientDisplay" style="
        background: linear-gradient(135deg, #ffebee, #ffcdd2);
        padding: 15px;
        border-radius: 12px;
        margin: 20px 0;
        border: 3px solid var(--red);
        color: var(--red);
        font-weight: 700;
        display: none;
      ">
        ⚠️ Insufficient amount! Need ₱<span id="shortAmount">0.00</span> more
      </div>

      <div style="display: flex; gap: 15px; margin-top: 30px;">
        <button id="btnCancelCash" style="
          flex: 0.5;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          background: linear-gradient(135deg, #9e9e9e, #757575);
          color: white;
        ">
          Cancel
        </button>
        <button id="btnConfirmCash" style="
          flex: 1;
          padding: 18px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          background: linear-gradient(135deg, #4CAF50, #66BB6A);
          color: white;
          opacity: 0.5;
        " disabled>
          Confirm Payment
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const input = document.getElementById("amountPaidInput");
  const changeDisplay = document.getElementById("changeDisplay");
  const changeAmount = document.getElementById("changeAmount");
  const insufficientDisplay = document.getElementById("insufficientDisplay");
  const shortAmount = document.getElementById("shortAmount");
  const btnConfirm = document.getElementById("btnConfirmCash");

  input.focus();

  input.addEventListener("input", () => {
    const amountPaid = parseFloat(input.value) || 0;
    const change = amountPaid - totalAmount;

    if (amountPaid >= totalAmount) {
      changeDisplay.style.display = "block";
      insufficientDisplay.style.display = "none";
      changeAmount.textContent = `₱${change.toFixed(2)}`;
      btnConfirm.disabled = false;
      btnConfirm.style.opacity = "1";
    } else if (amountPaid > 0) {
      changeDisplay.style.display = "none";
      insufficientDisplay.style.display = "block";
      shortAmount.textContent = (totalAmount - amountPaid).toFixed(2);
      btnConfirm.disabled = true;
      btnConfirm.style.opacity = "0.5";
    } else {
      changeDisplay.style.display = "none";
      insufficientDisplay.style.display = "none";
      btnConfirm.disabled = true;
      btnConfirm.style.opacity = "0.5";
    }
  });

  const confirmPayment = () => {
    const amountPaid = parseFloat(input.value) || 0;
    if (amountPaid < totalAmount) {
      alert("⚠️ Insufficient payment amount!");
      input.focus();
      return;
    }

    const change = amountPaid - totalAmount;
    document.body.removeChild(modal);
    processSale(cart, "cash");
    showSuccessModal(
      "Cash",
      totalAmount,
      totalProfit,
      null,
      amountPaid,
      change
    );
  };

  btnConfirm.addEventListener("click", confirmPayment);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !btnConfirm.disabled) {
      confirmPayment();
    }
  });

  document.getElementById("btnCancelCash").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

function showCustomerNameModal(totalAmount) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); 
    display: flex; justify-content: center; align-items: center; 
    z-index: 10000; animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
      
      .checkout-modal {
        background: #ffffff;
        border-radius: 20px;
        padding: 40px; 
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        border: 4px solid #f3cf7a;
        animation: slideUp 0.4s ease;
        text-align: center;
      }
      .customer-input {
        width: 100%;
        padding: 15px;
        border: 2px solid #cc561e; 
        border-radius: 10px;
        font-size: 18px;
        text-align: center;
        margin-bottom: 50px; 
        box-sizing: border-box;
        color: #aa2b1d;
        outline: none;
      }
      .input-group {
        margin-bottom: 50px;
      }
      .checkout-buttons {
        display: flex;
        flex-direction: row; 
        gap: 20px; 
      }
      .checkout-btn {
        flex: 1;
        padding: 18px 5px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        color: white;
        box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        white-space: nowrap; 
      }
      .btn-cancel {
        background: #808080; 
      }
      .btn-credit {
        background: #7ca352; 
      }
    </style>
    <div class="checkout-modal">
      <h2 style="color: #aa2b1d; margin-bottom: 10px; font-size: 28px;">📝 Credit Payment</h2>
      <p style="color: #666; margin-bottom: 25px;">Enter customer name for credit record:</p>

      <div class="input-group">
        <input type="text" 
              id="customerNameInput" 
              class="customer-input"
              placeholder="Customer Name"
              autocomplete="off">
      </div>

      <div class="checkout-buttons">
        <button class="checkout-btn btn-cancel" id="btnCancelCredit">
          Cancel
        </button>
        <button class="checkout-btn btn-credit" id="btnConfirmCredit">
          Confirm Credit
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const input = document.getElementById("customerNameInput");
  const btnCancel = document.getElementById("btnCancelCredit");
  const btnConfirm = document.getElementById("btnConfirmCredit");

  input.focus();

  btnCancel.onmouseenter = () => {
    btnCancel.style.transform = "translateY(-3px)";
    btnCancel.style.background = "#696969";
  };
  btnCancel.onmouseleave = () => {
    btnCancel.style.transform = "translateY(0)";
    btnCancel.style.background = "#808080";
  };

  btnConfirm.onmouseenter = () => {
    btnConfirm.style.background = "#2e7d32";
    btnConfirm.style.transform = "translateY(-3px)";
  };
  btnConfirm.onmouseleave = () => {
    btnConfirm.style.background = "#7ca352";
    btnConfirm.style.transform = "translateY(0)";
  };

  const confirmCredit = () => {
    const customerName = input.value.trim();
    if (!customerName) {
      alert("⚠️ Customer name is required!");
      input.focus();
      return;
    }
    document.body.removeChild(modal);
    processSale(cart, "credit", customerName);
    showSuccessModal("Credit", totalAmount, null, customerName);
  };

  btnConfirm.onclick = confirmCredit;
  btnCancel.onclick = () => document.body.removeChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter") confirmCredit();
  };
}

function showSuccessModal(
  paymentType,
  totalAmount,
  totalProfit = null,
  customerName = null,
  amountPaid = null,
  change = null
) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  const profitInfo = totalProfit
    ? `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
      <strong style="color: var(--brown);">Profit:</strong>
      <span style="color: var(--green); font-weight: 700;">₱${totalProfit.toFixed(
        2
      )}</span>
    </div>
  `
    : "";

  const customerInfo = customerName
    ? `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
      <strong style="color: var(--brown);">Customer:</strong>
      <span>${customerName}</span>
    </div>
  `
    : "";

  const cashDetails =
    amountPaid !== null && change !== null
      ? `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
      <strong style="color: var(--brown);">Amount Paid:</strong>
      <span>₱${amountPaid.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; border-top: 2px dashed var(--primary); margin-top: 10px;">
      <strong style="color: var(--green);">Change:</strong>
      <span style="color: var(--green); font-weight: 800; font-size: 24px;">₱${change.toFixed(
        2
      )}</span>
    </div>
  `
      : "";

  modal.innerHTML = `
    <style>
      @keyframes successPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
    <div style="
      background: linear-gradient(135deg, #ffffff, #f8f9fa);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 4px solid var(--primary);
      animation: slideUp 0.4s ease;
      text-align: center;
    ">
      <div style="font-size: 72px; margin-bottom: 20px; animation: successPop 0.5s ease;">✅</div>
      <h2 style="color: var(--green); margin-bottom: 20px; font-size: 28px;">Sale Completed!</h2>
      <div style="
        background: linear-gradient(135deg, #fff9e6, #ffffff);
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 2px solid var(--primary);
      ">
        ${customerInfo}
        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px;">
          <strong style="color: var(--brown);">Amount:</strong>
          <span style="font-weight: 700;">₱${totalAmount.toFixed(2)}</span>
        </div>
        ${profitInfo}
        ${cashDetails}
        <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 16px; border-top: 2px solid var(--primary); margin-top: 10px;">
          <strong style="color: var(--brown);">Payment:</strong>
          <span style="color: var(--accent); font-weight: 700; text-transform: uppercase;">${paymentType}</span>
        </div>
      </div>
      <button id="btnCloseSuccess" style="
        width: 100%;
        padding: 18px;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        background: linear-gradient(135deg, #4CAF50, #66BB6A);
        color: white;
        margin-top: 20px;
      ">
        Done
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const btnClose = document.getElementById("btnCloseSuccess");
  btnClose.addEventListener("mouseenter", () => {
    btnClose.style.background = "linear-gradient(135deg, #2E7D32, #43A047)";
    btnClose.style.transform = "translateY(-3px)";
  });
  btnClose.addEventListener("mouseleave", () => {
    btnClose.style.background = "linear-gradient(135deg, #4CAF50, #66BB6A)";
    btnClose.style.transform = "translateY(0)";
  });

  btnClose.addEventListener("click", () => {
    document.body.removeChild(modal);
    finalizeCheckout();
  });

  setTimeout(() => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
      finalizeCheckout();
    }
  }, 5000);
}

function finalizeCheckout() {
  cart = [];
  updateCartDisplay();

  const searchInput = document.getElementById("generalSearch");
  const searchResults = document.getElementById("searchResults");
  const clearSearchBtn = document.getElementById("btnClearCartSearch");

  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";
  if (clearSearchBtn) clearSearchBtn.style.display = "none";

  if (typeof renderInventory === "function") renderInventory();
  if (typeof renderProfit === "function") renderProfit();
  if (typeof renderDebtors === "function") renderDebtors();
  if (typeof renderPriceList === "function") renderPriceList();
}

function processSale(items, paymentType, customerName = null) {
  fetch("/process-sale/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
    body: JSON.stringify({
      cart: items,
      payment_type: paymentType,
      customer_name: customerName,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        if (data.updated_products) {
          window.serverProducts = data.updated_products;
        }

        if (data.updated_debtors) {
          window.serverDebtors = data.updated_debtors;
        }

        if (data.updated_sales) {
          window.serverSales = data.updated_sales;
        }

        if (typeof renderInventory === "function") renderInventory();
        if (typeof renderProfit === "function") renderProfit();
        if (typeof renderDebtors === "function") renderDebtors();
      } else {
        alert("❌ Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("❌ Network error. Failed to process sale.");
    });
}

function handleSearch() {
  const searchTerm = document
    .getElementById("generalSearch")
    .value.toLowerCase()
    .trim();
  const products = window.serverProducts || [];
  const searchResults = document.getElementById("searchResults");

  if (!searchTerm) {
    searchResults.innerHTML = "";
    return;
  }
  const matches = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm) && parseInt(p.quantity) > 0
  );

  if (matches.length === 0) {
    searchResults.innerHTML =
      '<p class="no-results">❌ No products found<br><small>Try a different search term</small></p>';
    return;
  }

  let html =
    '<div class="product-search-header"><strong>Search Results:</strong></div><div class="product-list">';

  matches.forEach((product) => {
    const inCart = cart.find((item) => item.id === product.id);
    const cartQty = inCart ? inCart.quantity : 0;
    const price = parseFloat(product.price);
    const stock = parseInt(product.quantity);

    html += `
      <div class="product-item ${inCart ? "product-in-cart" : ""}" 
          data-product-id="${product.id}"
          onclick="addToCart(${product.id})"
          style="cursor: pointer;">
        <div class="product-info">
          <div class="product-name-row">
            <strong>${product.name}</strong>
            ${
              inCart
                ? `<span class="in-cart-badge">✓ ${cartQty} in cart</span>`
                : ""
            }
          </div>
          <div class="product-details-row">
            <span class="product-price">₱${price.toFixed(2)}</span>
            <span class="product-stock">${stock} available</span>
          </div>
        </div>
        <div class="product-action">
          ${
            inCart
              ? '<span class="edit-qty-hint">Click to edit ✏️</span>'
              : '<span class="add-hint">Click to add +</span>'
          }
        </div>
      </div>
    `;
  });

  html += "</div>";
  searchResults.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) checkoutBtn.onclick = handleCheckout;

  const searchInput = document.getElementById("generalSearch");
  if (searchInput) searchInput.addEventListener("input", handleSearch);

  updateCartDisplay();
});

function clearSearch() {
  const searchInput = document.getElementById("generalSearch");
  const searchResults = document.getElementById("searchResults");
  const clearBtn = document.getElementById("btnClearCartSearch");

  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";
  if (clearBtn) clearBtn.style.display = "none";
  if (searchInput) searchInput.focus();
}

window.cart = cart;
window.clearSearch = clearSearch;
