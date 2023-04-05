/**
 * @author Ellen Min
 * CS132 Spring 2022
 *
 * Supports the following GET requests:
 *
 * GET /products?type=
 * GET products/:location
 * 
 * POST /promotions
 * POST /contact
 * 
 * NOTE TO GRADER: I chose to implement the Chosen Features (OPTION 1)
 * and (OPTION 4) though I indicated other options in the proposal.
 */

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const globby = require("globby");
const { response } = require("express");
const res = require("express/lib/response");
const { json } = require("express/lib/response");
const multer = require("multer");

const SERVER_ERROR = "the server is not working. Please try again later!";
const SERVER_ERR_CODE = 500;
const CLIENT_ERR_CODE = 400;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(multer().none());

/**
 * Returns JSON array of all products. Optional query parameter
 * allows filtering by type of product.
 */
app.get("/products", async (req, res, next) => {
  const type = req.query["type"];
  try {
    let catalog = await getCatalog();
    if (type) {
      let filteredCatalog = [];
      catalog.forEach((item) => {
        if (item.type === type) {
          filteredCatalog.push(item);
        }
      });
      res.json(filteredCatalog);
    } else {
      res.json(catalog);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Returns JSON array of information about a single product.
 */
app.get("/products/:location", async (req, res, next) => {
  try {
    let locationName = req.params.location.toLowerCase();
    let path = "data/products/" + locationName;
    let locationInfo = await getLocationData(path);
    res.json(locationInfo);
  } catch (err) {
    if (err.code == "ENOENT") {
      res.status(CLIENT_ERR_CODE);
      err.message = "the requested product does not exist.";
    } else {
      res.status(SERVER_ERR_CODE);
      err.message = SERVER_ERROR;
    }
    next(err);
  }
});

/**
 * Returns JSON array of all promotions.
 */
 app.get("/promotions", async (req, res, next) => {
  try {
    let promotions = await getPromotions();
    res.json(promotions);
  } catch (err) {
    res.status(SERVER_ERR_CODE);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Updates the messages.txt file in the form
 * <email> : <msg> based on body of request,
 * which should contain email and message.
 */
app.post("/contact", async (req, res, next) => {
  // 1. Validate parameters and set errors otherwise.
  let msgReq = null;
  let email = req.body.email;
  let msg = req.body.msg;
  if (email && msg) {
    msgReq = {
      "email" : email,
      "msg" : msg
    };
  }
  if (!msgReq) {
    res.status(CLIENT_ERR_CODE);
    next(Error("please enter a valid email and message."));
  }

  // 2. Append message to messages.json file
  try {
    let currMsg = msgReq.email + " : " + msgReq.msg + "\n";
    await fs.appendFile("messages.txt", currMsg, "utf8");
    res.type("text");
    res.send("thank you for your message!");
  } catch(err) {
    res.status(SERVER_ERR_CODE);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Updates the loyalty.json file in the form
 * {name: name, email: email, phone: phone} 
 * based on body of request, which should contain name, email, and phone.
 */
app.post("/loyalty", async (req, res, next) => {
  // 1. Validate parameters and set errors otherwise.
  let newCustomer = null;
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  if (name && email && phone) {
    newCustomer = {
      "name" : name,
      "email" : email,
      "phone" : phone
    };
  }
  if (!newCustomer) {
    res.status(CLIENT_ERR_CODE);
    next(Error("please enter a valid name, email, and phone number."));
  }

  let currCustomers = [];

  // 2. If no file exists, will raise error.
  try {
    currCustomers = await fs.readFile("loyalty.json", "utf8");
  } catch (err) {
    if (err.code !== "ENOENT") {
      res.status(SERVER_ERR_CODE);
      err.message = SERVER_ERROR;
      next(err);
    }
  }

  currCustomers = await JSON.parse(currCustomers);
  currCustomers.push(newCustomer);

  try {
    await fs.writeFile("loyalty.json", JSON.stringify(currCustomers, null, 2), "utf8");
    res.type("text");
    res.send("thank you for joining our team!");
  } catch(err) {
    res.status(SERVER_ERR_CODE);
    err.message = SERVER_ERROR;
    next(err);
  }
});

/**
 * Helper function to generate JSON of all products.
 * @returns {JSON} data for all products
 */
async function getCatalog() {
  let catalog = [];
  let locations = await globby(`data/products`, { onlyDirectories: true });

  for (let i = 0; i < locations.length; i++) {
    let info = await getLocationData(locations[i]);
    catalog.push(info);
  }
  return catalog;
}

/**
 * Helper function to generate JSON of a single product.
 * @param {string} path directory path for the product.
 * @returns {JSON} JSON data for single product
 */
async function getLocationData(path) {
  let contents = await fs.readFile(path + "/info.txt", "utf8");
  let data = contents.split("\n");

  let name = data[0];
  let price = data[1];
  let dist = data[2];
  let description = data[3];
  let imgPath = data[4];
  let type = data[5];
  let imgAlt = data[6];

  return {
    name: name,
    price: price,
    dist: dist,
    description: description,
    imgPath: imgPath,
    type: type,
    imgAlt: imgAlt
  };
}

/**
 * Helper function to generate JSON for all promotions.
 * @returns JSON for all promotions
 */
async function getPromotions() {
  let promotions = [];
  let promDirs = await globby(`data/promotions`);

  for (let i = 0; i < promDirs.length; i++) {
    let info = await getPromotionData(promDirs[i]);
    promotions.push(info);
  }
  return promotions;
}

/**
 * Helper function to generate JSON data for single promotion.
 * @param {string} path 
 * @returns JSON data for a single promotion
 */
async function getPromotionData(path) {
  let contents = await fs.readFile(path, "utf8");
  let data = contents.split("\n");

  let name = data[0];
  let oldprice = data[1];
  let price = data[2]
  let description = data[3];
  let id = data[4];

  return {
    name: name,
    oldprice: oldprice,
    price: price,
    description: description,
    id: id
  };
}

/**
   * Default error handler sending the error to the page.
   * @param {Error} err error
   */
function errHandler(err, req, res, next) {
  res.type("text");
  res.send(err.message);
}

app.use(errHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT);

/**
 * Returns an array of all product names and its attributes.
 */
/*app.get("/products", async (req, res, next) => {
  const price = req.query["price"];
  try {
    let catalog = await getCatalog();
    if (price) {
      let filteredCatalog = [];
      let p = parseInt(price);
      catalog.forEach(item => {
        if (item.price < p) {
          filteredCatalog.push(item);
        }
      })
      res.json(filteredCatalog);
    } else {
      res.json(catalog);
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE);
    err.message = SERVER_ERROR;
    next(err);
  }
})*/
