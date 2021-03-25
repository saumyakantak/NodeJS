const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Product= require('../models/product');
const User = require('../models/user');
const Cart= require('../models/cart');

exports.getPosts = (req, res, next) => {
  let totalItems;
  Product.findAndCountAll()
    .then((count, rows) => {
      totalItems = count;
      res.status(200).json({
        message: 'Fetched posts successfully.',
        posts: rows,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.testAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  User.findOne({where:{id:req.userId}})
  .then(result=>{
    return result;
  })
  .then(usr=>{
    usr.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
    .then(p=>{
      return p;
    })
    .then(resp=>{
      res.status(200).json({ message:"inserted successfully", product:resp });
    })
  })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Product.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};