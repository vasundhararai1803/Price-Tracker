const SCRAPER_API_KEY = "f0a98ed09c33d3a3d6759f3adb6c32c7"; 

chrome.alarms.create("checkPrices", { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkPrices") {
    checkPrices();
  }
});

async function checkPrices() {
  chrome.storage.local.get({ products: [] }, async (data) => {
    let updatedProducts = [];

    for (let product of data.products) {
      let newPrice = await fetchPrice(product.url);

      if (newPrice && product.lastPrice && newPrice < product.lastPrice) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Price Dropped!",
          message: `Price dropped for: ${product.name}\nNew Price: ₹${newPrice}`,
        });
      }

      updatedProducts.push({ name: product.name, url: product.url, lastPrice: newPrice });
    }

    chrome.storage.local.set({ products: updatedProducts });
  });
}

async function fetchPrice(url) {
  const apiUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    let response = await fetch(apiUrl);
    let html = await response.text();

    let price = extractPriceFromHTML(html, url);
    return price;
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
}

function extractPriceFromHTML(html, url) {
  let price = null;

  if (url.includes("amazon.in")) {
    let match = html.match(/"priceblock_ourprice"[^>]*>([^<]+)/);
    price = match ? parseFloat(match[1].replace(/[₹,]/g, "")) : null;
  }

  if (url.includes("flipkart.com")) {
    let match = html.match(/"selling-price"[^>]*>([^<]+)/);
    price = match ? parseFloat(match[1].replace(/[₹,]/g, "")) : null;
  }

  if (url.includes("myntra.com")) {
    let match = html.match(/"pdp-price"[^>]*>([^<]+)/);
    price = match ? parseFloat(match[1].replace(/[₹,]/g, "")) : null;
  }

  if (url.includes("ajio.com")) {
    let match = html.match(/"price"[^>]*>([^<]+)/);
    price = match ? parseFloat(match[1].replace(/[₹,]/g, "")) : null;
  }

  if (url.includes("nykaa.com")) {
    let match = html.match(/"price"[^>]*>([^<]+)/);
    price = match ? parseFloat(match[1].replace(/[₹,]/g, "")) : null;
  }

  return price;
}
