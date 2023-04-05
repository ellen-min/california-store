/**
* @author Ellen Min
* Last updated: 06-06-2022
* This is the javascript page for loyalty.html. It adds
  interactivity to keep track of user input in the form.
*/

 (function() {
  "use strict";

  const DEBUG = true;
  const BASE_URL = "/";
  const LOYALTY_EP = BASE_URL + "loyalty";

  /**
   * Sets up interactivity between submitting the form and
   * recording the inputted data.
   */
  function init() {
    id("loyalty-form").addEventListener("submit", (evt) => {
      evt.preventDefault();
      addCustomer();
    });
  }

  /**
   * Makes a POST request to alter the data of loyalty customers
   * accordingly.
   */
  async function addCustomer() {
    let params = new FormData(id("loyalty-form"));
    let header = { method : "POST", body : params };

    try {
      let resp = await fetch(LOYALTY_EP, header);
      checkStatus(resp);
      resp = await resp.text();
      id("response").textContent = resp;
    } catch(err) {
      handleError(err);
    }
  }

  /**
   * Displays an error to the user if server goes wrong.
   * @param {Error} err error
   */
   function handleError(err) {
    id("response").textContent = "Something went wrong. Try again later?";
    if (DEBUG) {
      console.error(err);
    }
  }
  
  init();
})();