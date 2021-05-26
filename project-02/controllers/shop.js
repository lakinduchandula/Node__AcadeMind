const Product = require("../models/product");
const Order = require("../models/order");

// export this get methods shop product middleware func
exports.getProducts = (req, res, next) => {
  // directly call to static func through class name Product
  /*************************************** NOTE *************************************
   * find() method is inside of mongoose so it will give all product but it didn't  *
   * give the cursor back, but if we nedd .cursor() we can use .next() as well      *
   **********************************************************************************/
  Product.find()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// Index Page Controller
exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  /********************************************** NOTE *****************************************************
   * findById() method is inside of mongoose, we can pass string to it, it will convert to a ObjectId auto *
   * req.params can access the dynamic content after /products/:productId had,                             *
   * but in here very essential to same the name after : (productId) and the req.params (productId).       *
   *********************************************************************************************************/
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        path: "/products", // which navigation should highlight
        pageTitle: product.title, // which page title should display
        product: product, // passing product arry to the shop/product-detail.ejs file
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// Cart Page Controller
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.product") // this will specifically return the prod doc
    .execPopulate() // populate not return promise by default therefore -> execPopulate
    .then(user => {
      const products = user.cart.items;
      // console.log('getCART products ==>' , user.cart.items)
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      //console.log(result);
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

// Order Page Controller
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// post orders
exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.product") // this will specifically return the prod doc
    .execPopulate() // populate not return promise by default therefore -> execPopulate
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.product._doc } };
      });
      const order = new Order({
        products: products,
        user: {
          userId: req.user,
          name: req.user.name,
        },
      });
      order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};

// Checkout Page Controller
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
