document.addEventListener("DOMContentLoaded", () => {
  // Load the saved theme from chrome storage (if any)
  chrome.storage.local.get({ theme: 'light' }, (data) => {
    if (data.theme === 'dark') {
      document.getElementById('themeStylesheet').setAttribute('href', 'dark.css');
      document.getElementById('toggleMode').textContent = 'Switch to Light Mode';
    }
  });

  // Add event listener for the toggle button
  document.getElementById("toggleMode").addEventListener("click", () => {
    let currentTheme = document.getElementById('themeStylesheet').getAttribute('href');

    // Toggle the theme
    if (currentTheme === 'light.css') {
      document.getElementById('themeStylesheet').setAttribute('href', 'dark.css');
      document.getElementById('toggleMode').textContent = 'Switch to Light Mode';
      chrome.storage.local.set({ theme: 'dark' });
    } else {
      document.getElementById('themeStylesheet').setAttribute('href', 'light.css');
      document.getElementById('toggleMode').textContent = 'Switch to Dark Mode';
      chrome.storage.local.set({ theme: 'light' });
    }
  });

  // Add event listener to track current product
  document.getElementById("track").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.includes("amazon.in") || tab.url.includes("flipkart.com") || tab.url.includes("myntra.com") || tab.url.includes("ajio.com") || tab.url.includes("nykaa.com")) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractProductName,
        },
        (result) => {
          const productName = result[0].result;
          chrome.storage.local.get({ products: [] }, (data) => {
            let products = data.products;
            if (!products.find((p) => p.name === productName)) {
              products.push({ name: productName, url: tab.url, lastPrice: null });
              chrome.storage.local.set({ products }, displayTrackedProducts);
              alert("Product added to tracking list!");
            } else {
              alert("Product is already being tracked!");
            }
          });
        }
      );
    } else {
      alert("This extension only works on Amazon, Flipkart, Myntra, Ajio & Nykaa product pages.");
    }
  });

  // Display tracked products with delete button
  function displayTrackedProducts() {
    chrome.storage.local.get({ products: [] }, (data) => {
      let list = document.getElementById("trackedItems");
      list.innerHTML = "";

      data.products.forEach((item, index) => {
        let li = document.createElement("li");

        // Product link
        let a = document.createElement("a");
        a.href = item.url;
        a.textContent = item.name;
        a.target = "_blank";

        // Delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => removeProduct(index));

        li.appendChild(a);
        li.appendChild(deleteBtn);
        list.appendChild(li);
      });
    });
  }

  // Remove product from the tracking list
  function removeProduct(index) {
    chrome.storage.local.get({ products: [] }, (data) => {
      let products = data.products;
      products.splice(index, 1); // Remove product by index
      chrome.storage.local.set({ products }, displayTrackedProducts);
    });
  }

  // Extract product name from the page
  function extractProductName() {
    return document.title.trim();
  }

  // Load tracked products when popup opens
  displayTrackedProducts();
});
