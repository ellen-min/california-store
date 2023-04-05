/**
* @author Ellen Min
* Last updated: 06-06-2022
* This is the javascript page for promotions.html. It allows
  users to see promotions based on location.
*/

 (function() {
  "use strict";

  const DEBUG = true;
  const BASE_URL = "/";
  const PROM_EP = BASE_URL + "promotions";

  /**
   * Populates the promotions page based on promotions available.
   */
  async function init() {
    try {
      let resp = await fetch(PROM_EP);
      resp = checkStatus(resp);
      let data = await resp.json();
      displayPromotions(data);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Populates the page with all running promotions.
   * @param {JSON} data JSON data of all available promotions
   */
  function displayPromotions(data) {
    id("running-promotions").innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      let product = genBlurb(data[i]);
      id("running-promotions").appendChild(product);
    }
  }

  /**
   * Generates the section for each promotion.
   * @param {JSON} data JOSN data for a single promotion
   * @returns section corresponding to the given promotion.
   */
  function genBlurb(data) {
    let art = gen("article");
    art.id = data.id;

    let name = gen("h2");
    name.textContent = data.name;
    art.appendChild(name);

    let par = genPar(data);
    art.appendChild(par);
    
    art.addEventListener("click", showPromotion);
    return art;
  }

  /**
   * Generates the description of each promotion.
   * @param {JSON} data JSON data for one promotion
   * @returns a paragraph description of the promotion, 
   *          which is intiially hidden
   */
  function genPar(data) {
    let par = gen("p");
    par.id = data.id + "-description";

    let oldprice = gen("p");
    oldprice.textContent = "previously $" + data.oldprice + ".00";
    
    let price = gen("p");
    price.textContent = "now $" + data.price + ".00";

    let desc = gen("h3");
    desc.textContent = data.description;

    par.appendChild(oldprice);
    par.appendChild(price);
    par.appendChild(desc);

    par.classList.add("hidden");
    return par;
  }

  /**
   * Toggles the hidden class for each promotion.
   */
  function showPromotion() {
    let parId = this.id + "-description";
    id(parId).classList.toggle("hidden");
  }

  /* -------------------- ERROR HANDLING --------------------*/
  /**
   * Displays an error to the user if server goes wrong.
   * @param {Error} err error
   */
  function handleError(err) {
    console.log("Something went wrong, try again later!");
    if (DEBUG) {
      console.error(err);
    }
  }
  
  init();
})();