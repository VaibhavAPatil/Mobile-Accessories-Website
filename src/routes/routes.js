const express = require("express");
const Router = express.Router();

const authentication = require("../middleware/authentication");

const loginUser = require("../controllers/userController/userLogin");
const createUser = require("../controllers/userController/createUser");
const getUserDetails = require("../controllers/userController/getUser");
const updateUser = require("../controllers/userController/updateUser");
const deleteUser = require("../controllers/userController/deleteUser");

const createdProduct = require("../controllers/productController/createProduct");
const {
    getProductByFilter,
    getProductById,
} = require("../controllers/productController/getProduct");
const updateProduct = require("../controllers/productController/updateProduct");
const delProduct = require("../controllers/productController/deleteProduct");

const updatCart = require("../controllers/cartController/updateCart");
const getCart = require("../controllers/cartController/getCart");
const emptyCart = require("../controllers/cartController/emptyCart");

Router.post("/create/user/", createUser);
Router.post("/login/user/", loginUser);
Router.get("/user/:userId/profile", authentication, getUserDetails);
Router.put("/user/:userId/profile", authentication, updateUser);
Router.delete("/user/:userId/profile", authentication, deleteUser);

Router.post("/admin/create/product", createdProduct);
Router.get("/products", getProductByFilter);
Router.get("/products/:productId", getProductById);
Router.put("/admin/products/:productId", updateProduct);
Router.delete("/admin/products/:productId", delProduct);

Router.put("/users/:userId/cart", authentication, updatCart);
Router.get("/users/:userId/cart", authentication, getCart);
Router.delete("/users/:userId/cart", emptyCart);

Router.get("/app", (req, res) => {
    res.send({ data: { name: "akhilesh", lname: "patil", age: 20 } });
});

Router.all("/*", (req, res) => {
    res.status(404).send({ status: false, message: "invalid request!!" });
});

module.exports = Router;
