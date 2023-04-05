/**
* @author Ellen Min
* Last updated: 06-06-2022
* This is the javascript page for index.html. It populates
the page with products, the single product views, and adds
filter interactivity.
*/

(function () {
  "use strict";

  const BASE_URL = "/";
  const PRODUCTS_EP = BASE_URL + "products";

  const DEBUG = true;

  /**
   * Populates the page with products and their views
   * and adds interactivity based on the filters.
   */
  async function init() {
    try {
      let resp = await fetch(PRODUCTS_EP);
      resp = checkStatus(resp);
      let data = await resp.json();
      displayProducts(data);
      loadProductViews(data);
      addFilterInteractions(data);
    } catch (err) {
      handleError(err);
    }
  }

  /* -------------------- LOAD ALL PRODUCTS --------------------*/
  /**
   * Loads all products onto the page storefront.
   * @param {JSON} data JSON data of all the products
   */
  function displayProducts(data) {
    id("storefront").innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      let product = genCard(data[i], i);
      id("storefront").appendChild(product);
    }
  }

  /**
   * Helper function to generate a card for each individual product.
   * @param {JSON} data JSON data of one product
   * @param {int} i the number of the product (for rainbow)
   */
  function genCard(data, i) {
    let productId = data.imgPath.substring(4).slice(0, -5);

    let productArticle = gen("article");
    productArticle.id = data.imgPath.substring(4).slice(0, -5) + "-pic";
    i = i % 7;
    productArticle.classList.add("color" + i);

    let productImg = gen("img");
    productImg.src = data.imgPath;
    productImg.alt = data.imgAlt;
    if (window.sessionStorage.getItem(productId)) {
      productImg.classList.add("sold");
    }

    productArticle.appendChild(productImg);
    productArticle.addEventListener("click", showProduct);
    return productArticle;
  }

  /* -------------------- LOAD SINGLE PRODUCT --------------------*/
  
  /**
   * Hides the storefront view and shows the single view of the
   * product that was clicked.
   */
  function showProduct() {
    id("landing-page").classList.toggle("hidden");
    let photoId = this.id;

    let viewId = photoId.slice(0, -3) + "view";
    id(viewId).classList.toggle("hidden");
  }

  /**
   * Loads all single product views, which are initially hidden.
   * @param {JSON} data JSON data of all products
   */
  function loadProductViews(data) {
    id("products").innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      let product = loadSingleView(data[i]);
      id("products").append(product);
    }
  }

  /**
   * Helper function to load the single view of one product.
   * @param {JSON} data JSON data for one product
   */
  function loadSingleView(product) {
    let productDiv = gen("div");

    productDiv.id = product.imgPath.substring(4).slice(0, -5) + "-view";
    productDiv.classList.add("hidden");

    let productSection = genProductSection(product);
    productDiv.appendChild(productSection);
    
    return productDiv;
  }

  /**
   * Helper function to generate the entire product page, which
   * is wrapped in a <section> element.
   * @param {JSON} product JSON data for one product
   * @returns the entire section for one product.
   */
  function genProductSection(product) {
    let productSection = gen("section");
    productSection.classList.add("single-view");
    
    let productArticle = genProductArticle(product);
    let productAside = genProductAside(product);

    productSection.appendChild(productArticle);
    productSection.appendChild(productAside);

    return productSection;
  }

  /**
   * Helper function to generate an article for one product.
   * @param {JSON} product JSON data for one product.
   * @returns an article for one product
   */
  function genProductArticle(product) {
    let productArticle = gen("article");
    let productImg = gen("img");
    productImg.src = product.imgPath;
    productImg.alt = product.imgAlt;
    let productId = product.imgPath.substring(4).slice(0, -5);
    if (window.sessionStorage.getItem(productId)) {
      productImg.classList.add("sold");
    }
    productArticle.appendChild(productImg);
    return productArticle;
  }

  /**
   * Helper function to generate the aside with information for one product
   * @param {JSON} product JSON data for one product
   * @returns an aside for the product
   */
  function genProductAside(product) {
    let productAside = gen("aside");

    let header = gen("h2");
    header.textContent = product.name;
    let infoList = genProductInfoList(product);
    let cart = genCart(product);

    productAside.appendChild(header);
    productAside.appendChild(infoList);
    productAside.appendChild(cart);

    return productAside;
  }

  /**
   * Helper function to generate the cart for the aside.
   * @param {JSON} product JSON data for one product
   * @returns the cart part of the aside
   */
  function genCart(product) {
    let cartDiv = gen("div");
    
    let cartImg = genCartImg(product);
    let cartName = gen("h3");
    cartName.textContent = "add to cart";
    let cartMsg = gen("p");
    cartMsg.id = product.imgPath.substring(4).slice(0, -5) + "-cartMsg";

    cartDiv.appendChild(cartImg);
    cartDiv.appendChild(cartName);
    cartDiv.appendChild(cartMsg);

    cartDiv.classList.add("cart");
    return cartDiv;
  }

  /**
   * Helper function to generate the cart image part of the aside.
   * @param {JSON} product JSOn data for one product
   * @returns the cart image for an aside
   */
  function genCartImg(product) {
    let img = gen("img");
    img.id = product.id = product.imgPath.substring(4).slice(0, -5) + "-cart";
    img.src = "img/cart.jpeg";
    img.alt = "cart with palm trees";
    img.classList.add("cart");
    img.addEventListener("click", addToCart);
    return img;
  }

  /**
   * Adds an item to cart and displays a message to the user depending on whether
   * the item was able to be added or if the item was sold already.
   */
  function addToCart() {
    let productId = this.id.slice(0, -5);
    let msg = "";
    if (!window.sessionStorage.getItem(productId)) {
      window.sessionStorage.setItem(productId, "sold");
      msg = "successfully added to cart!";
    } else {
      msg = "sorry! this item has already been sold.";
    }
    displayCartMsg(productId, msg);
  }

  /**
   * Helper function to display a message to the user briefly.
   * @param {string} productId the id of the product
   * @param {string} message the message to display
   */
  function displayCartMsg(productId, message) {
    id(productId + "-cartMsg").textContent = message;
    setTimeout(() => {
      id(productId + "-cartMsg").textContent = "";
    }, 750);
  }

  /**
   * Helper function to generate the product information part of the aside.
   * @param {JSON} product JSON data for one product
   * @returns an unordered list of information about given product
   */
  function genProductInfoList(product) {
    let infoList = gen("ul");

    let price = gen("li");
    price.textContent = "$" + product.price + ".00";
    let dist = gen("li");
    dist.textContent = product.dist + " miles away";
    let description = gen("li");
    description.textContent = product.description;

    infoList.appendChild(price);
    infoList.appendChild(dist);
    infoList.appendChild(description);

    return infoList;
  }

  /* -------------------- FILTER PRODUCTS --------------------*/
  /**
   * Adds interactivity for each filter to allow the page to display
   * only corresponding products.
   */
  function addFilterInteractions() {
    let checkboxes = qsa("input[name='type-loc']");
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener("change", filterProducts);
    }
  }

  /**
   * Filters products by requesting data that matches the user's
   * desired type of product.
   */
  async function filterProducts() {
    let type = this.id;
    let REQUEST_URL = PRODUCTS_EP + "?type=" + type;

    try {
      let resp = await fetch(REQUEST_URL);
      resp = checkStatus(resp);
      let data = await resp.json();
      displayFilteredProducts(data, type);
    } catch(err) {
      handleError(err);
    }
  }

  /**
   * Helper function to display products that match the type.
   * @param {JSON} data JSON data of all products
   * @param {String} type the type of product to display
   */
   function displayFilteredProducts(data, type) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].type == type) {
        let productId = data[i].imgPath.substring(4).slice(0, -5) + "-pic";
        id(productId).classList.toggle("hidden");
      }
    }
  }

  /* -------------------- ERROR HANDLING --------------------*/
  function handleError(err) {
    console.log("something went wrong, try again later!");
    if (DEBUG) {
      console.error(err);
    }
  }

  init();
})();
