// server/static/server/js/pricelist.js

let selectedPriceCategory = null;

window.renderPriceList = function () {
  const content = document.getElementById("priceListContent");
  if (!content) return;

  if (!selectedPriceCategory) {
    renderPriceCategorySelection(content);
  } else {
    renderCategoryPriceList(content, selectedPriceCategory);
  }
};

function renderPriceCategorySelection(content) {
  const products = window.serverProducts || [];

  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: var(--accent); margin-bottom: 10px;">💲 Select Category to Update Prices</h2>
      <p style="color: var(--brown); font-size: 14px;">Choose a category to view and update product prices</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 30px;">
  `;

  const categories = window.CATEGORIES || [];

  categories.forEach((category) => {
    const categoryProducts = products.filter((p) => p.category === category.id);
    const totalItems = categoryProducts.length;

    const avgProfit =
      totalItems > 0
        ? categoryProducts.reduce(
            (sum, p) => sum + (parseFloat(p.price) - parseFloat(p.cost)),
            0
          ) / totalItems
        : 0;

    const lowMargin = categoryProducts.filter((p) => {
      const cost = parseFloat(p.cost);
      const price = parseFloat(p.price);
      return cost > 0 && ((price - cost) / cost) * 100 < 20;
    }).length;

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
            <span class="stat-number">₱${avgProfit.toFixed(2)}</span>
            <span class="stat-label">Avg Profit</span>
          </div>
          <div class="category-stat">
            <span class="stat-number">${lowMargin}</span>
            <span class="stat-label">Low Margin</span>
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
      .category-card:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: var(--accent);
        box-shadow: 0 12px 30px rgba(6, 80, 132, 0.3);
      }
      .category-icon { font-size: 64px; text-align: center; margin-bottom: 15px; }
      .category-name { text-align: center; color: var(--accent); font-size: 18px; font-weight: 700; min-height: 44px; display: flex; align-items: center; justify-content: center; }
      .category-stats { display: flex; justify-content: space-around; padding-top: 15px; border-top: 2px solid var(--primary); }
      .category-stat { text-align: center; display: flex; flex-direction: column; gap: 5px; }
      .stat-number { font-size: 20px; font-weight: 800; color: var(--brown); }
      .stat-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; }
    </style>
  `;

  content.innerHTML = html;

  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", function () {
      selectedPriceCategory = this.getAttribute("data-category");
      renderPriceList();
    });
  });
}

function renderCategoryPriceList(content, categoryId) {
  const categories = window.CATEGORIES || [];
  const category = categories.find((c) => c.id === categoryId);
  const products = (window.serverProducts || []).filter(
    (p) => p.category === categoryId
  );

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <button class="btn-back" id="btnBackToPriceCategories">
        ← Back to Categories
      </button>
      <h2 style="color: var(--accent); margin: 0;">
        ${category.icon} ${category.name} - Price List
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
    
    <p class="info-text">💡 Click on any price to edit it. Changes are saved automatically.</p>
  `;

  if (products.length === 0) {
    html +=
      '<p class="no-data">No products in this category yet. Add products in the Inventory page.</p>';
  } else {
    html += `
      <table class="price-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Cost Price (₱)</th>
            <th>Selling Price (₱)</th>
            <th>Profit Margin</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
    `;

    products.forEach((product) => {
      const cost = parseFloat(product.cost);
      const price = parseFloat(product.price);
      const profit = price - cost;
      const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;
      const marginClass = profit > 0 ? "profit-positive" : "profit-negative";

      html += `
        <tr>
          <td><strong>${product.name}</strong></td>
          <td>
            <input type="number" value="${cost.toFixed(
              2
            )}" class="price-input price-cost-input" data-product-id="${
        product.id
      }" step="0.01">
          </td>
          <td>
            <input type="number" value="${price.toFixed(
              2
            )}" class="price-input price-sell-input" data-product-id="${
        product.id
      }" step="0.01">
          </td>
          <td class="${marginClass}">
            ₱${profit.toFixed(2)} (${margin}%)
          </td>
          <td>${product.quantity} units</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
  }

  content.innerHTML = html;

  document.getElementById("btnBackToPriceCategories").onclick = () => {
    selectedPriceCategory = null;
    renderPriceList();
  };

  document.querySelectorAll(".price-input").forEach((input) => {
    input.addEventListener("change", function () {
      const field = this.classList.contains("price-cost-input")
        ? "cost"
        : "price";
      updatePrice(this.getAttribute("data-product-id"), field, this.value);
    });
  });
}

async function updatePrice(id, field, newValue) {
  const value = parseFloat(newValue);

  if (isNaN(value) || value < 0) {
    alert("⚠️ Invalid price! Must be 0 or greater.");
    renderPriceList();
    return;
  }

  const product = (window.serverProducts || []).find((p) => p.id == id);

  if (!product) {
    alert("⚠️ Product not found!");
    return;
  }

  if (field === "price" && value < parseFloat(product.cost)) {
    const confirmLoss = confirm(
      `⚠️ Warning: Selling price (₱${value.toFixed(
        2
      )}) is lower than cost price (₱${parseFloat(product.cost).toFixed(
        2
      )}).\n\n` + `This will result in a loss. Continue anyway?`
    );
    if (!confirmLoss) {
      renderPriceList();
      return;
    }
  }

  if (field === "cost" && value > parseFloat(product.price)) {
    const confirmLoss = confirm(
      `⚠️ Warning: Cost price (₱${value.toFixed(
        2
      )}) is higher than selling price (₱${parseFloat(product.price).toFixed(
        2
      )}).\n\n` + `This will result in a loss. Continue anyway?`
    );
    if (!confirmLoss) {
      renderPriceList();
      return;
    }
  }

  const payload = {
    id: parseInt(id),
    action: "update_qty",
    type: "set",
    new_qty: product.quantity,
    new_cost: field === "cost" ? value : parseFloat(product.cost),
    new_price: field === "price" ? value : parseFloat(product.price),
  };

  try {
    const response = await fetch("/add-product/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": window.CSRF_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === "success") {
      product[field] = value;

      const fieldName = field === "cost" ? "Cost" : "Selling";
      alert(
        `✓ ${fieldName} price updated for ${product.name}: ₱${value.toFixed(2)}`
      );

      renderPriceList();

      if (typeof window.renderInventory === "function") {
        window.renderInventory();
      }
    } else {
      alert("❌ Error: " + result.message);
      renderPriceList();
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("❌ Network error. Changes not saved.");
    renderPriceList();
  }
}

window.updatePrice = updatePrice;
window.selectedPriceCategory = selectedPriceCategory;
