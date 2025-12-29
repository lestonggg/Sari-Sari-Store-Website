// server/static/server/js/profit.js

window.renderProfit = function () {
  const sales = window.serverSales || [];
  const products = window.serverProducts || [];
  const content = document.getElementById("profitContent");
  if (!content) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = todayStart;
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const periods = {
    today: { revenue: 0, profit: 0, count: 0 },
    yesterday: { revenue: 0, profit: 0, count: 0 },
    week: { revenue: 0, profit: 0, count: 0 },
    month: { revenue: 0, profit: 0, count: 0 },
    year: { revenue: 0, profit: 0, count: 0 },
  };

  sales.forEach((sale) => {
    const saleDate = new Date(sale.timestamp);
    const total = parseFloat(sale.total_amount) || 0;
    const profit = parseFloat(sale.total_profit) || 0;

    if (saleDate >= todayStart) {
      periods.today.revenue += total;
      periods.today.profit += profit;
      periods.today.count++;
    }

    if (saleDate >= yesterdayStart && saleDate < yesterdayEnd) {
      periods.yesterday.revenue += total;
      periods.yesterday.profit += profit;
      periods.yesterday.count++;
    }

    if (saleDate >= weekStart) {
      periods.week.revenue += total;
      periods.week.profit += profit;
      periods.week.count++;
    }

    if (saleDate >= monthStart) {
      periods.month.revenue += total;
      periods.month.profit += profit;
      periods.month.count++;
    }

    if (saleDate >= yearStart) {
      periods.year.revenue += total;
      periods.year.profit += profit;
      periods.year.count++;
    }
  });

  let potentialProfit = 0;
  products.forEach((product) => {
    const cost = parseFloat(product.cost) || 0;
    const price = parseFloat(product.price) || 0;
    const qty = parseInt(product.quantity) || 0;
    potentialProfit += (price - cost) * qty;
  });

  let html = `
    <style>
      .btn-clear-history {
        padding: 10px 20px;
        background: linear-gradient(135deg, var(--red), #ef5350);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.2s ease;
        text-transform: uppercase;
        box-shadow: 0 3px 0 #c62828;
      }
      
      .btn-clear-history:hover {
        background: linear-gradient(135deg, #c62828, #e53935);
        transform: translateY(-2px);
        box-shadow: 0 5px 0 #b71c1c, 0 6px 15px rgba(0,0,0,0.3);
      }
      
      .btn-clear-history:active {
        transform: translateY(0);
        box-shadow: 0 1px 0 #c62828;
      }

      .profit-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 15px;
      }
    </style>

    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: var(--accent); margin-bottom: 5px;">📊 Sales Performance</h2>
      <p style="color: #666; font-size: 13px;">Sales automatically reset at midnight (12:00 AM)</p>
    </div>

    <h3 style="color: var(--teal); margin-bottom: 15px;">💰 Today's Sales</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, #4CAF50, #66BB6A);">
        <h3>Revenue</h3>
        <div class="profit-amount">₱${periods.today.revenue.toFixed(2)}</div>
        <small>${periods.today.count} sales</small>
      </div>
      <div class="profit-card" style="background: linear-gradient(135deg, #2E7D32, #43A047);">
        <h3>Profit</h3>
        <div class="profit-amount profit-highlight">₱${periods.today.profit.toFixed(
          2
        )}</div>
        <small>from today</small>
      </div>
    </div>

    <h3 style="color: var(--teal); margin: 25px 0 15px 0;">📅 Yesterday's Sales</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, #FF9800, #FFB74D);">
        <h3>Revenue</h3>
        <div class="profit-amount">₱${periods.yesterday.revenue.toFixed(
          2
        )}</div>
        <small>${periods.yesterday.count} sales</small>
      </div>
      <div class="profit-card" style="background: linear-gradient(135deg, #F57C00, #FF9800);">
        <h3>Profit</h3>
        <div class="profit-amount">₱${periods.yesterday.profit.toFixed(2)}</div>
        <small>from yesterday</small>
      </div>
    </div>

    <h3 style="color: var(--teal); margin: 25px 0 15px 0;">📊 This Week's Sales</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, #2196F3, #42A5F5);">
        <h3>Revenue</h3>
        <div class="profit-amount">₱${periods.week.revenue.toFixed(2)}</div>
        <small>${periods.week.count} sales</small>
      </div>
      <div class="profit-card" style="background: linear-gradient(135deg, #1976D2, #2196F3);">
        <h3>Profit</h3>
        <div class="profit-amount">₱${periods.week.profit.toFixed(2)}</div>
        <small>last 7 days</small>
      </div>
    </div>

    <h3 style="color: var(--teal); margin: 25px 0 15px 0;">📆 This Month's Sales</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, #9C27B0, #BA68C8);">
        <h3>Revenue</h3>
        <div class="profit-amount">₱${periods.month.revenue.toFixed(2)}</div>
        <small>${periods.month.count} sales</small>
      </div>
      <div class="profit-card" style="background: linear-gradient(135deg, #7B1FA2, #9C27B0);">
        <h3>Profit</h3>
        <div class="profit-amount">₱${periods.month.profit.toFixed(2)}</div>
        <small>this month</small>
      </div>
    </div>

    <h3 style="color: var(--teal); margin: 25px 0 15px 0;">📈 This Year's Sales</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, #E91E63, #F06292);">
        <h3>Revenue</h3>
        <div class="profit-amount">₱${periods.year.revenue.toFixed(2)}</div>
        <small>${periods.year.count} sales</small>
      </div>
      <div class="profit-card" style="background: linear-gradient(135deg, #C2185B, #E91E63);">
        <h3>Profit</h3>
        <div class="profit-amount">₱${periods.year.profit.toFixed(2)}</div>
        <small>from Jan 1</small>
      </div>
    </div>

    <h3 style="color: var(--teal); margin: 25px 0 15px 0;">💎 Potential Profit</h3>
    <div class="profit-summary">
      <div class="profit-card" style="background: linear-gradient(135deg, var(--primary), var(--accent));">
        <h3>From Current Inventory</h3>
        <div class="profit-amount">₱${potentialProfit.toFixed(2)}</div>
        <small>if all stock sells</small>
      </div>
    </div>

    <div class="recent-sales" style="margin-top: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">📝 Recent Sales</h3>
        ${
          sales.length > 0
            ? `
          <button class="btn-clear-history" id="btnClearHistory">
            🗑️ Clear Transaction History
          </button>
        `
            : ""
        }
      </div>
      ${renderRecentSalesTable(sales.slice(-10).reverse())}
    </div>
    `;

  content.innerHTML = html;

  const clearBtn = document.getElementById("btnClearHistory");
  if (clearBtn) clearBtn.onclick = clearTransactionHistory;

  setupMidnightRefresh();
};

function renderRecentSalesTable(recentSales) {
  if (recentSales.length === 0) {
    return '<p class="no-data">No sales recorded yet. Start making sales to see them here!</p>';
  }

  let html = `
    <table class="sales-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Items</th>
          <th>Total</th>
          <th>Profit</th>
          <th>Payment</th>
        </tr>
      </thead>
      <tbody>`;

  recentSales.forEach((sale) => {
    console.log("Checking Sale:", sale.id, "Items:", sale.items);

    const date = new Date(sale.timestamp);
    const formattedDate = date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let itemsData = sale.items;

    if (typeof itemsData === "string") {
      try {
        itemsData = JSON.parse(itemsData);
      } catch (e) {
        itemsData = [];
      }
    }

    const itemsList =
      Array.isArray(itemsData) && itemsData.length > 0
        ? itemsData.map((i) => `${i.name} (${i.quantity})`).join(", ")
        : "No items recorded";

    const amount = parseFloat(sale.total_amount || 0);
    const profit = parseFloat(sale.total_profit || 0);

    html += `
      <tr>
        <td>
          <strong>${formattedDate}</strong><br>
          <small style="color: #666;">${formattedTime}</small>
        </td>
        <td><small>${itemsList}</small></td>
        <td><strong>₱${amount.toFixed(2)}</strong></td>
        <td class="profit-positive">₱${profit.toFixed(2)}</td>
        <td>
          <span class="payment-badge ${sale.payment_type}">
            ${sale.payment_type ? sale.payment_type.toUpperCase() : "N/A"}
          </span>
        </td>
      </tr>
    `;
  });

  return html + "</tbody></table>";
}

function clearTransactionHistory() {
  if (
    !confirm(
      "⚠️ WARNING: This will permanently delete all sales records from the database. Are you sure?"
    )
  )
    return;

  fetch("/clear-sales-history/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": window.CSRF_TOKEN,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("✓ Transaction history cleared successfully!");
        location.reload();
      } else {
        alert("Error: " + data.message);
      }
    });
}

function setupMidnightRefresh() {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const msUntilMidnight = tomorrow - now;

  if (window.midnightTimeout) clearTimeout(window.midnightTimeout);

  window.midnightTimeout = setTimeout(() => {
    location.reload();
  }, msUntilMidnight);
}

window.renderProfit = renderProfit;
