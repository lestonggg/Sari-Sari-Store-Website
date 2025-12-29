// server/static/server/js/inventory.js

let djangoProducts = window.serverProducts || [];

const CATEGORIES = [
  { id: "bath", name: "Bath, Hygiene & Laundry Soaps", icon: "🧼" },
  { id: "foods", name: "Whole Foods", icon: "🍚" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "school", name: "School Supplies", icon: "📚" },
  { id: "liquor", name: "Hard Liquors", icon: "🍺" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
];

let selectedCategory = null;

window.renderInventory = function () {
  const content = document.getElementById("inventoryContent");

  if (!selectedCategory) {
    renderCategorySelection(content);
  } else {
    renderCategoryInventory(content, selectedCategory);
  }
};

function renderCategorySelection(content) {
  const products = djangoProducts;

  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: var(--accent); margin-bottom: 10px;">📦 Select Product Category</h2>
      <p style="color: var(--brown); font-size: 14px;">Choose a category to view and manage products</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 30px;">
  `;

  CATEGORIES.forEach((category) => {
    const categoryProducts = products.filter((p) => p.category === category.id);
    const totalItems = categoryProducts.length;
    const lowStock = categoryProducts.filter(
      (p) => p.quantity < 10 && p.quantity > 0
    ).length;
    const outOfStock = categoryProducts.filter((p) => p.quantity === 0).length;

    html += `
      <div class="category-card" data-category="${category.id}">
        <div class="category-icon">${category.icon}</div>
        <h3 class="category-name">${category.name}</h3>
        <div class="category-stats">
          <div class="category-stat">
            <span class="stat-number">${totalItems}</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="category-stat">
            <span class="stat-number">${lowStock}</span>
            <span class="stat-label">Low Stock</span>
          </div>
          <div class="category-stat">
            <span class="stat-number">${outOfStock}</span>
            <span class="stat-label">Out</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    
    <style>
      .category-card {
        background: linear-gradient(135deg, #ffffff, #f8f9fa);
        border: 3px solid var(--primary);
        border-radius: 20px;
        padding: 30px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        position: relative;
        overflow: hidden;
      }
      
      .category-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(120, 185, 181, 0.1), transparent);
        transform: rotate(45deg);
        transition: all 0.5s ease;
      }
      
      .category-card:hover::before {
        right: 100%;
      }
      
      .category-card:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: var(--accent);
        box-shadow: 0 12px 30px rgba(6, 80, 132, 0.3);
        background: linear-gradient(135deg, #f8f9fa, #e8f4f8);
      }
      
      .category-card:active {
        transform: translateY(-4px) scale(1);
      }
      
      .category-icon {
        font-size: 64px;
        text-align: center;
        margin-bottom: 15px;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
      }
      
      .category-name {
        text-align: center;
        color: var(--accent);
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 20px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .category-stats {
        display: flex;
        justify-content: space-around;
        padding-top: 15px;
        border-top: 2px solid var(--primary);
      }
      
      .category-stat {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .stat-number {
        font-size: 24px;
        font-weight: 800;
        color: var(--brown);
      }
      
      .stat-label {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
        font-weight: 600;
      }
    </style>
  `;

  content.innerHTML = html;

  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", function () {
      selectedCategory = this.getAttribute("data-category");
      renderInventory();
    });
  });
}

function renderCategoryInventory(content, categoryId) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const products = djangoProducts.filter((p) => p.category === categoryId);

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <button class="btn-back" id="btnBackToCategories">
        ← Back to Categories
      </button>
      <h2 style="color: var(--accent); margin: 0;">
        ${category.icon} ${category.name}
      </h2>
      <div style="width: 150px;"></div>
    </div>
    
    <style>
      .btn-back {
        padding: 12px 24px;
        background: linear-gradient(135deg, #9e9e9e, #757575);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
        box-shadow: 0 3px 0 #616161;
      }
      
      .btn-back:hover {
        background: linear-gradient(135deg, #757575, #616161);
        transform: translateY(-2px);
        box-shadow: 0 5px 0 #424242;
      }
      
      .btn-back:active {
        transform: translateY(0);
        box-shadow: 0 1px 0 #616161;
      }
    </style>
    
    <div class="add-product-section">
      <h3>➕ Add New Product to ${category.name}</h3>
      <div class="add-product-form">
        <input type="text" id="newProductName" placeholder="Product Name" class="form-input">
        <input type="number" id="newProductCost" placeholder="Cost Price (₱)" step="0.01" min="0" class="form-input">
        <input type="number" id="newProductPrice" placeholder="Selling Price (₱)" step="0.01" min="0" class="form-input">
        <input type="number" id="newProductQty" placeholder="Quantity" min="0" class="form-input">
        <button class="btn-add" id="btnAddProduct">
          <span>✓</span> Add Product
        </button>
      </div>
    </div>
    <hr style="margin: 30px 0; border: 2px solid var(--primary); opacity: 0.3;">
    
    <h3>📦 Products in ${category.name}</h3>
    <div class="inventory-stats">
      <div class="stat-box">
        <span class="stat-label">Total Products</span>
        <span class="stat-value">${products.length}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Low Stock Items</span>
        <span class="stat-value">${
          products.filter((p) => p.quantity < 10 && p.quantity > 0).length
        }</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">Out of Stock</span>
        <span class="stat-value">${
          products.filter((p) => p.quantity === 0).length
        }</span>
      </div>
    </div>

    <table class="inventory-table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Cost Price</th>
          <th>Selling Price</th>
          <th>Quantity</th>
          <th>Value</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="inventoryTableBody">
  `;

  if (products.length === 0) {
    html += `
      <tr>
        <td colspan="6" class="no-data">
          No products in this category yet. Add your first product above!
        </td>
      </tr>
    `;
  } else {
    products.forEach((product) => {
      const stockClass =
        product.quantity === 0
          ? "out-of-stock"
          : product.quantity < 10
          ? "low-stock"
          : "";
      const stockValue = (product.cost * product.quantity).toFixed(2);

      html += `
        <tr class="${stockClass}">
          <td><strong>${product.name}</strong></td>
          <td>₱${parseFloat(product.cost).toFixed(2)}</td>
          <td>₱${parseFloat(product.price).toFixed(2)}</td>
          <td>
            <div class="qty-controls">
              <button class="btn-qty-small btn-qty-decrease" data-product-id="${
                product.id
              }">−</button>
              <input type="number" 
                    value="${product.quantity}" 
                    data-product-id="${product.id}"
                    class="qty-input qty-update"
                    min="0">
              <button class="btn-qty-small btn-qty-increase" data-product-id="${
                product.id
              }">+</button>
            </div>
          </td>
          <td>₱${stockValue}</td>
          <td>
            <button class="btn-delete btn-delete-product" data-product-id="${
              product.id
            }" title="Delete this product">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    });
  }

  html += `
      </tbody>
    </table>
  `;

  content.innerHTML = html;

  document
    .getElementById("btnBackToCategories")
    .addEventListener("click", function () {
      selectedCategory = null;
      renderInventory();
    });

  const addBtn = document.getElementById("btnAddProduct");
  if (addBtn) {
    addBtn.addEventListener("click", () => addNewProduct(categoryId));
  }

  document.querySelectorAll(".qty-update").forEach((input) => {
    input.addEventListener("change", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      updateQuantity(productId, this.value);
    });
  });

  document.querySelectorAll(".btn-qty-decrease").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      const product = djangoProducts.find((p) => p.id === productId);
      if (product && product.quantity > 0) {
        updateQuantity(productId, product.quantity - 1);
      }
    });
  });

  document.querySelectorAll(".btn-qty-increase").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      const product = djangoProducts.find((p) => p.id === productId);
      if (product) {
        updateQuantity(productId, product.quantity + 1);
      }
    });
  });

  document.querySelectorAll(".btn-delete-product").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = parseInt(this.getAttribute("data-product-id"));
      deleteProduct(productId);
    });
  });

  const inputs = [
    "newProductName",
    "newProductCost",
    "newProductPrice",
    "newProductQty",
  ];
  inputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          addNewProduct(categoryId);
        }
      });
    }
  });
}

async function addNewProduct(categoryId) {
  const name = document.getElementById("newProductName").value.trim();
  const cost = document.getElementById("newProductCost").value;
  const price = document.getElementById("newProductPrice").value;
  const quantity = document.getElementById("newProductQty").value;

  if (!name) {
    alert("⚠️ Please enter a product name!");
    document.getElementById("newProductName").focus();
    return;
  }

  if (isNaN(cost) || cost < 0 || cost === "") {
    alert("⚠️ Please enter a valid cost price!");
    document.getElementById("newProductCost").focus();
    return;
  }

  if (isNaN(price) || price < 0 || price === "") {
    alert("⚠️ Please enter a valid selling price!");
    document.getElementById("newProductPrice").focus();
    return;
  }

  if (isNaN(quantity) || quantity < 0 || quantity === "") {
    alert("⚠️ Please enter a valid quantity!");
    document.getElementById("newProductQty").focus();
    return;
  }

  if (parseFloat(price) < parseFloat(cost)) {
    const confirmLoss = confirm(
      "⚠️ Warning: Selling price is lower than cost price. This will result in a loss. Continue anyway?"
    );
    if (!confirmLoss) return;
  }

  const existingProducts = djangoProducts.filter(
    (p) => p.category === categoryId
  );
  const duplicate = existingProducts.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    const confirmUpdate = confirm(
      `Product "${name}" already exists in this category. Do you want to add to its quantity instead?`
    );
    if (confirmUpdate) {
      const updatePayload = {
        id: duplicate.id,
        action: "update_qty",
        type: "delta",
        change: parseInt(quantity),
        new_cost: parseFloat(cost),
        new_price: parseFloat(price),
      };
      await sendInventoryRequest(
        updatePayload,
        `✓ Updated "${name}" - Added ${quantity} units!`
      );
    } else {
      return;
    }
  } else {
    const newPayload = {
      name,
      cost: parseFloat(cost),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: categoryId,
      action: "add_new",
    };

    await sendInventoryRequest(
      newPayload,
      `✓ Product "${name}" added successfully!`
    );
  }

  document.getElementById("newProductName").value = "";
  document.getElementById("newProductCost").value = "";
  document.getElementById("newProductPrice").value = "";
  document.getElementById("newProductQty").value = "";
  document.getElementById("newProductName").focus();

  renderInventory();
  if (typeof renderPriceList === "function") {
    renderPriceList();
  }
}

async function updateQuantity(id, newQty) {
  const quantity = parseInt(newQty);

  if (isNaN(quantity) || quantity < 0) {
    alert("⚠️ Invalid quantity! Must be 0 or greater.");
    renderInventory();
    return;
  }

  const product = djangoProducts.find((p) => p.id === id);

  if (quantity === 0) {
    const confirmZero = confirm(
      `Set quantity to 0 for "${product.name}"? This will mark it as out of stock.`
    );
    if (!confirmZero) {
      renderInventory();
      return;
    }
  }

  const updatePayload = {
    id: id,
    action: "update_qty",
    type: "set",
    new_qty: quantity,
  };

  await sendInventoryRequest(updatePayload);

  if (quantity < 10 && quantity > 0) {
    console.log(
      `⚠️ Low stock alert: ${product.name} has only ${quantity} units remaining.`
    );
  }
}

async function deleteProduct(id) {
  const product = djangoProducts.find((p) => p.id === id);

  if (!product) {
    alert("⚠️ Product not found!");
    return;
  }

  const confirmDelete = confirm(
    `Are you sure you want to delete "${product.name}"?\n\n` +
      `Current Stock: ${product.quantity} units\n` +
      `This action cannot be undone!`
  );

  if (confirmDelete) {
    if (product.quantity > 0) {
      const confirmWithStock = confirm(
        `⚠️ WARNING: This product still has ${product.quantity} units in stock!\n\n` +
          `Are you absolutely sure you want to delete it?`
      );

      if (!confirmWithStock) {
        return;
      }
    }

    const payload = {
      id: id,
      action: "delete",
    };

    await sendInventoryRequest(
      payload,
      `✓ Product "${product.name}" has been deleted.`
    );
  }
}

async function sendInventoryRequest(data, successMsg) {
  try {
    const response = await fetch("/add-product/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": window.CSRF_TOKEN,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.status === "success") {
      if (data.action === "add_new") {
        const newProd = {
          id: result.product_id,
          name: data.name,
          category: data.category,
          cost: parseFloat(data.cost),
          price: parseFloat(data.price),
          quantity: parseInt(data.quantity),
        };
        djangoProducts.push(newProd);
      } else if (data.action === "update_qty") {
        const p = djangoProducts.find((item) => item.id === data.id);
        if (p) {
          if (data.type === "delta") p.quantity += data.change;
          else p.quantity = data.new_qty;
        }
      } else if (data.action === "delete") {
        djangoProducts = djangoProducts.filter((item) => item.id !== data.id);
      }

      renderInventory();

      if (typeof renderPriceList === "function") renderPriceList();

      if (successMsg) {
        alert(successMsg);
      }
    } else {
      alert("❌ Error: " + result.message);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

window.CATEGORIES = CATEGORIES;
