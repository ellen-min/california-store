/**
* @author Ellen Min
* Last updated: 06-06-2022
* This is the javascript page for cart.html. It populates 
  the page and adds features based on user interactivity.
*/

(function () {
  "use strict";

  const BASE_URL = "/";
  const PRODUCTS_EP = BASE_URL + "products";

  const DEBUG = true;

  /**
   * Fetches the products, populates the page with products, 
   * and displays the total for all products.
   */
  async function init() {
    try {
      let resp = await fetch(PRODUCTS_EP);
      resp = checkStatus(resp);
      let data = await resp.json();
      displayProducts(data);
      displayTotal(data);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Displays products that were previously added to cart.
   * @param {JSON} data JSON of all products
   */
  function displayProducts(data) {
    id("cart").innerHTML = "";

    for (let i = 0; i < data.length; i++) {
      let productId = data[i].imgPath.substring(4).slice(0, -5);
      if (window.sessionStorage.getItem(productId) === "sold") {
        let item = genCard(data[i]);
        id("cart").appendChild(item);
      }
    }
  }

  /**
   * Displays the total price of all products in the cart.
   * @param {JSON} data JSON of all products
   */
  function displayTotal(data) {
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      let productId = data[i].imgPath.substring(4).slice(0, -5);
      if (window.sessionStorage.getItem(productId) === "sold") {
        let currPrice = parseInt(data[i].price);
        total += currPrice;
      }
    }
    id("cart-total").textContent = "total: $" + total + ".00";
  }

  /**
   * Helper function to generate an article/card for one product.
   * @param {JSON} data JSON data for one product
   * @returns article corresponding to the inputted product
   */
  function genCard(data) {
    let productArticle = gen("article");
    productArticle.id = data.imgPath.substring(4).slice(0, -5) + "-pic-cart";

    let productImg = gen("img");
    productImg.src = data.imgPath;
    productImg.alt = data.imgAlt;

    productArticle.appendChild(productImg);
    productArticle.addEventListener("click", toggleName);

    let productText = genExpansion(data);
    productArticle.appendChild(productText);

    return productArticle;
  }

  /**
   * Helper function to generate description and remove option for item.
   * This is originally hidden.
   * @param {JSON} data JSON data for one product
   * @returns expansion corresponding to the inputted product
   */
  function genExpansion(data) {
    let productId = data.imgPath.substring(4).slice(0, -5);

    let productExpansion = gen("div");
    productExpansion.id = productId + "-exp-cart";

    let productText = gen("p");
    productText.textContent = data.name
    
    let productPrice = gen("p");
    productPrice.textContent = "$" + data.price + ".00";

    let removeButton = genButton(productId);

    productExpansion.appendChild(productText);
    productExpansion.appendChild(productPrice);
    productExpansion.appendChild(removeButton);
    productExpansion.classList.add("hidden");
    return productExpansion;
  }

  /**
   * Helper function to generate a button.
   * @param {string} productId id for the product attached to button
   */
  function genButton(productId) {
    let removeButton = gen("button");
    removeButton.id = productId + "-remove";
    removeButton.textContent = "remove item";
    removeButton.addEventListener("click", removeItem);
    return removeButton;
  }

  /**
   * Removes an item that was clicked.
   */
  async function removeItem() {
    let productId = this.id.slice(0, -7);
    let PRODUCT_EP = PRODUCTS_EP + "/" + productId;
    try {
      let resp = await fetch(PRODUCT_EP);
      resp = checkStatus(resp);
      let data = await resp.json();
      updateItem(productId, data);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Helper function to hide the pic (temporarily) and update the
   * running total.
   * @param {string} productId id of the product to be removed
   * @param {JSON} data JSON data of the product to be removed
   */
  function updateItem(productId, data) {
    window.sessionStorage.removeItem(productId);
    let articleId = productId + "-pic-cart";
    let productArt = id(articleId);
    id("cart").removeChild(productArt);

    let currTotal = id("cart-total").textContent;
    currTotal = parseInt(currTotal.slice(8));

    let currPrice = data.price;
    let newPrice = currTotal - currPrice;
    id("cart-total").textContent = "total: $" + newPrice + ".00";
  }

  /**
   * Helper function to show/hide the name of a product upon click.
   */
  function toggleName() {
    let expId = this.id.slice(0, -9) + "-exp-cart";
    id(expId).classList.toggle("hidden");
  }

  /* -------------------- ERROR HANDLING --------------------*/
  /**
   * Displays an error to the user if server goes wrong.
   * @param {Error} err error
   */
  function handleError(err) {
    console.log("something went wrong, try again later!");
    if (DEBUG) {
      console.error(err);
    }
  }

  init();
})();
