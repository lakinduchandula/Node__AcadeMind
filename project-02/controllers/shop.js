const Product = require("../models/product");
const Cart = require("../models/cart");

// export this get methods shop product middleware func
exports.getProducts = (req, res, next) => {
  // directly call to static func through class name Product
  Product.fetchAll(products => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

// Index Page Controller
exports.getIndex = (req, res, next) => {
  /** FOR NOW PRODUCT LIST = INDEX PAGES **/

  // directly call to static func through class name Product
  Product.fetchAll(products => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getProduct = (req, res, next) => {
  /********************************************** NOTE ***************************************************
   * req.params can access the dynamic content after /products/:productId had,                           *
   *  but in here very essential to same the name after : (productId) and the req.params (productId).    *
   *******************************************************************************************************/
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render("shop/product-detail", {
      path: "/products", // which navigation should highlight
      pageTitle: product.title, // which page title should display
      product: product, // passing product arry to the shop/product-detail.ejs file
    });
  });
};

// Cart Page Controller
exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    path: "/cart",
    pageTitle: "Your Cart",
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
};

// Order Page Controller
exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

// Checkout Page Controller
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};