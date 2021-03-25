const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Product= require('../models/product');
const User = require('../models/user');
const Cart= require('../models/cart');

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    let usr;
    User.findOne({where:{id:req.userId}})
    .then(result=>{
        return result;
    })
    .then(user=>{
        usr=user;
        user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
          })
          .then(products => {
            return usr
              .createOrder()
              .then(order => {
                return order.addProducts(
                  products.map(product => {
                    product.orderItem = { quantity: product.cartItem.quantity };
                    return product;
                  })
                );
              })
              .catch(err => console.log(err));
          })
          .then(result => {
            return fetchedCart.setProducts(null);
          })
          .then(result => {
            res.status(200).json({ message:"Order Created" });
          })
          .catch(err => console.log(err));
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
  exports.getOrders = (req, res, next) => {
    User.findOne({where:{id:req.userId}})
    .then(result=>{
        return result;
    })
    .then(user=>{
        user.getOrders({include: ['products']})
        .then(orders => {
            res.status(200).json({ message:"Order Fetched", order:orders });
        })
        .catch(err => console.log(err));
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };