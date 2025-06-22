const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const cartModel = require("../models/cart-model");
const fs = require("fs");
const path = require("path");

// 🔹 Homepage
router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error });
});

// 🔹 Shop Page
router.get("/shop", isloggedin, async function (req, res) {
  try {
    const products = await productModel.find();
    const success = req.flash("success");
    res.render("shop", { products, success });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.render("shop", { products: [], success: [] });
  }
});

// 🔹 Create sample products (only for dev/testing)
router.get("/create-sample-products", async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "Urban Sling Bag",
        price: 899,
        bgcolor: "#f5f5f5",
        panelcolor: "#000000",
        textcolor: "#ffffff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag1.jpg"))
      },
      {
        name: "Leather Backpack",
        price: 1499,
        bgcolor: "#e0c9a6",
        panelcolor: "#2c2c2c",
        textcolor: "#ffffff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag2.jpg"))
      },
      {
        name: "Canvas Travel Pack",
        price: 1299,
        bgcolor: "#d7e1ec",
        panelcolor: "#1a1a1a",
        textcolor: "#ffffff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag3.jpg"))
      },
      {
        name: "Mini Sling Bag",
        price: 599,
        bgcolor: "#ffe4e1",
        panelcolor: "#333",
        textcolor: "#fff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag4.jpg"))
      },
      {
        name: "Classic Duffel",
        price: 1799,
        bgcolor: "#cce7d0",
        panelcolor: "#111",
        textcolor: "#eee",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag5.jpg"))
      },
      {
        name: "Executive Laptop Bag",
        price: 2199,
        bgcolor: "#e6e6fa",
        panelcolor: "#444",
        textcolor: "#fff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag6.jpg"))
      },
      {
        name: "Eco Tote Bag",
        price: 499,
        bgcolor: "#fafad2",
        panelcolor: "#222",
        textcolor: "#000",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag7.jpg"))
      },
      {
        name: "Luxury Travel Bag",
        price: 2899,
        bgcolor: "#f0e68c",
        panelcolor: "#000",
        textcolor: "#fff",
        image: fs.readFileSync(path.join(__dirname, "../public/images/bag8.jpg"))
      }
    ];

    await productModel.insertMany(sampleProducts);
    res.send("✅ 8 Sample products added! Go check /shop now.");
  } catch (err) {
    console.error("❌ Error adding sample products:", err);
    res.status(500).send("Failed to create sample products.");
  }
});

// 🔹 Add to cart
router.get("/add-to-cart/:id", isloggedin, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await cartModel.create({
        user: userId,
        products: [{ product: productId, quantity: 1 }],
      });
    } else {
      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await cart.save();
    }

    req.flash("success", "🛍️ Product added to cart!");
    res.redirect("/shop");
  } catch (err) {
    console.error(err);
    res.redirect("/shop");
  }
});

// 🔹 Cart Page (✅ Fixed version)
router.get("/cart", isloggedin, async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id }).populate("products.product");

    res.render("cart", { cart: cart || { products: [] } });
  } catch (err) {
    console.error(err);
    res.redirect("/shop");
  }
});

// 🔴 Remove item from cart
router.get("/remove-from-cart/:id", isloggedin, async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) return res.redirect("/cart");

    cart.products = cart.products.filter(item => item.product.toString() !== req.params.id);
    await cart.save();

    req.flash("success", "❌ Item removed from cart.");
    res.redirect("/cart");
  } catch (err) {
    console.error("Remove Error:", err);
    res.redirect("/cart");
  }
});

// ➕ Increase quantity
router.get("/cart/increase/:id", isloggedin, async (req, res) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  const index = cart.products.findIndex(p => p.product.toString() === req.params.id);
  if (index > -1) {
    cart.products[index].quantity += 1;
  }
  await cart.save();
  res.redirect("/cart");
});

// ➖ Decrease quantity
router.get("/cart/decrease/:id", isloggedin, async (req, res) => {
  const cart = await cartModel.findOne({ user: req.user._id });
  const index = cart.products.findIndex(p => p.product.toString() === req.params.id);
  if (index > -1 && cart.products[index].quantity > 1) {
    cart.products[index].quantity -= 1;
  } else {
    cart.products.splice(index, 1); // remove if quantity is 1
  }
  await cart.save();
  res.redirect("/cart");
});

module.exports = router;
