// server/static/server/js/dashboard.js

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active-page"));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active-page");
  }

  switch (pageId) {
    case "profitPage":
      if (typeof renderProfit === "function") renderProfit();
      break;
    case "pricePage":
      if (typeof renderPriceList === "function") renderPriceList();
      break;
    case "inventoryPage":
      if (typeof renderInventory === "function") renderInventory();
      break;
    case "debtPage":
      if (typeof renderDebtors === "function") renderDebtors();
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const btnProfit = document.getElementById("btnProfit");
  const btnPrice = document.getElementById("btnPrice");
  const btnInventory = document.getElementById("btnInventory");
  const btnDebt = document.getElementById("btnDebt");

  if (btnProfit) btnProfit.onclick = () => showPage("profitPage");
  if (btnPrice) btnPrice.onclick = () => showPage("pricePage");
  if (btnInventory) btnInventory.onclick = () => showPage("inventoryPage");
  if (btnDebt) btnDebt.onclick = () => showPage("debtPage");

  const cartBtn = document.getElementById("floatingCart");
  const searchPanel = document.getElementById("searchPanel");
  const searchInput = document.getElementById("generalSearch");

  if (cartBtn && searchPanel) {
    cartBtn.onclick = function (e) {
      e.stopPropagation();

      const isHidden = window.getComputedStyle(searchPanel).display === "none";

      if (isHidden) {
        searchPanel.style.display = "block";
        if (typeof updateCartDisplay === "function") updateCartDisplay();
        setTimeout(() => {
          if (searchInput) searchInput.focus();
        }, 50);
      } else {
        searchPanel.style.display = "none";
      }
    };
  }

  if (searchPanel) {
    searchPanel.onclick = (e) => e.stopPropagation();
  }

  document.addEventListener("click", function (e) {
    if (searchPanel && searchPanel.style.display === "block") {
      searchPanel.style.display = "none";
    }
  });

  showPage("profitPage");
});

function updateCartCount() {
  const cartCountBadge = document.querySelector(".cart-count");

  if (cartCountBadge && typeof window.cart !== "undefined") {
    const totalItems = window.cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartCountBadge.textContent = totalItems;
    cartCountBadge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

window.showPage = showPage;
window.updateCartCount = updateCartCount;

console.log("✓ JORAMS Store Dashboard & Cart Toggle script loaded!");
