// Inject a "Track Price" button into the product page.
const trackButton = document.createElement("button");
trackButton.textContent = "🔍 Track Price";
trackButton.style.position = "fixed";
trackButton.style.bottom = "20px";
trackButton.style.right = "20px";
trackButton.style.padding = "12px";
trackButton.style.backgroundColor = "#f7a500";
trackButton.style.color = "white";
trackButton.style.border = "none";
trackButton.style.borderRadius = "5px";
trackButton.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
trackButton.style.cursor = "pointer";
trackButton.style.fontSize = "16px";
trackButton.style.zIndex = "9999";

document.body.appendChild(trackButton);

// Add event listener to handle tracking logic
trackButton.addEventListener("click", () => {
  let productUrl = window.location.href;
  let productName = document.title; // Capture the product name

  chrome.storage.local.get({ products: [] }, (data) => {
    let products = data.products;
    if (!products.find((p) => p.url === productUrl)) {
      products.push({ url: productUrl, name: productName, lastPrice: null });
      chrome.storage.local.set({ products });
      alert(`${productName} added to tracking list!`);
    } else {
      alert("Product is already being tracked!");
    }
  });
});
