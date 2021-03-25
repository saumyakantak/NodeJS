const express = require('express');
const { body } = require('express-validator/check');

const cartController = require('../controllers/cart');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /cart/posts
router.get('/posts',isAuth, cartController.getCart);

// POST /cart/add
router.post('/add',isAuth, cartController.postCart);

// DELETE /cart/delete-item
router.delete('/delete-item', isAuth, cartController.cartDeleteProduct);

module.exports = router;
