/**
* @author Ellen Min
* Last updated: 06-06-2022
* This is the javascript page for contact.html. It allows the user
  to submit a message to the site.
*/

 (function() {
  "use strict";

  const DEBUG = true;
  const BASE_URL = "/";
  const CONTACT_EP = BASE_URL + "contact";

  /**
   * Adds interactivity to the form and allows the user to submit 
   * a message through the form.
   */
  function init() {
    id("msg-form").addEventListener("submit", (evt) => {
      evt.preventDefault();
      submitMsg();
    });
  }

  /**
   * Helper function to make a POST request to the API and record
   * the message based on the information entered in the form.
   */
  async function submitMsg() {
    let params = new FormData(id("msg-form"));
    let header = { method : "POST", body : params };

    try {
      let resp = await fetch(CONTACT_EP, header);
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
    id("response").textContent = "Your message could not be submitted. Sorry!";
    if (DEBUG) {
      console.error(err);
    }
  }
  
  init();
})();