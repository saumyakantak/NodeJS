const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Product= require('../models/product');
const User = require('../models/user');
const Cart= require('../models/cart');

exports.getCart = (req, res, next) => {

  User.findOne({where:{id:req.userId}})
  .then(result=>{
    return result;
  })
  .then(usr=>{
    usr.getCart()
    .then(cart => {
      if(!cart){
        return usr.createCart()
      }
      return cart
    })
    .then(cart=>{
      cart.getProducts()
      .then(products => {
          res.status(200).json({ message:"Cart Fetched", product:products });
      })
      .catch(err => console.log(err));
    })
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
}


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  User.findOne({where:{id:req.userId}})
  .then(result=>{
    return result;
  })
  .then(usr=>{
    usr.getCart()
    .then(cart => {
      if(!cart){
        return usr.createCart();
      }
      return cart;
    })
    .then(crt=>{
      fetchedCart = crt;
      return crt.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.status(200).json({ message:"Cart Made"});
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


exports.cartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  User.findOne({where:{id:req.userId}})
  .then(result=>{
    return result;
  })
  .then(user=>{
    user.getCart()
    .then(cart => {
      if(!cart){
        res.status(400).json({message:"Cart Not Found"});
        const error = new Error('Cart not Created yet');
        error.statusCode = 401;
        throw error;
      }
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      if(!product){
        res.status(400).json({message:"Product Not Found"});
        const error = new Error('Product not Created yet');
        error.statusCode = 401;
        throw error;
      }
      return product.cartItem.destroy();
    })
    .then(result => {
      res.status(200).json({ message:"Item Deleted"});
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


















// exports.testAddProduct = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error('Validation failed, entered data is incorrect.');
//     error.statusCode = 422;
//     throw error;
//   }

//   const title = req.body.title;
//   const imageUrl = req.body.imageUrl;
//   const price = req.body.price;
//   const description = req.body.description;

//   User.findOne({where:{id:req.userId}})
//   .then(result=>{
//     return result;
//   })
//   .then(usr=>{
//     usr.createProduct({
//       title: title,
//       price: price,
//       imageUrl: imageUrl,
//       description: description
//     })
//     .then(p=>{
//       return p;
//     })
//     .then(resp=>{
//       res.status(200).json({ message:"inserted successfully", product:resp });
//     })
//   })
//     .catch(err => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };

// exports.getPost = (req, res, next) => {
//   const postId = req.params.postId;
//   Product.findByPk(postId)
//     .then(post => {
//       if (!post) {
//         const error = new Error('Could not find post.');
//         error.statusCode = 404;
//         throw error;
//       }
//       res.status(200).json({ message: 'Post fetched.', post: post });
//     })
//     .catch(err => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };


// exports.deletePost = (req, res, next) => {
//   const prodId = req.params.postId;
//   Product.findByPk(prodId)
//     .then(product => {
//       if (!product) {
//         const error = new Error('Could not find post.');
//         error.statusCode = 404;
//         throw error;
//       }
//       if (product.userId !== req.userId) {
//         const error = new Error('Not authorized!');
//         error.statusCode = 403;
//         throw error;
//       }
//       return product.destroy();
//     })
//     .then(result => {
//       res.status(200).json({ message: 'Deleted post.' });
//     })
//     .catch(err => {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//       }
//       next(err);
//     });
// };



// // exports.updatePost = (req, res, next) => {
// //   const postId = req.params.postId;
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     const error = new Error('Validation failed, entered data is incorrect.');
// //     error.statusCode = 422;
// //     throw error;
// //   }
// //   const title = req.body.title;
// //   const content = req.body.content;
// //   let imageUrl = req.body.image;
// //   if (req.file) {
// //     imageUrl = req.file.path;
// //   }
// //   if (!imageUrl) {
// //     const error = new Error('No file picked.');
// //     error.statusCode = 422;
// //     throw error;
// //   }
// //   Post.findByPk(postId)
// //     .then(post => {
// //       if (!post) {
// //         const error = new Error('Could not find post.');
// //         error.statusCode = 404;
// //         throw error;
// //       }
// //       if (post.creator.toString() !== req.userId) {
// //         const error = new Error('Not authorized!');
// //         error.statusCode = 403;
// //         throw error;
// //       }
// //       if (imageUrl !== post.imageUrl) {
// //         clearImage(post.imageUrl);
// //       }
// //       post.title = title;
// //       post.imageUrl = imageUrl;
// //       post.content = content;
// //       return post.save();
// //     })
// //     .then(result => {
// //       res.status(200).json({ message: 'Post updated!', post: result });
// //     })
// //     .catch(err => {
// //       if (!err.statusCode) {
// //         err.statusCode = 500;
// //       }
// //       next(err);
// //     });
// // };

// // exports.getCart = (req, res, next) => {
// //   req.user
// //     .populate('cart.items.productId')
// //     .execPopulate()
// //     .then(user => {
// //       const products = user.cart.items;
// //       res.render('shop/cart', {
// //         path: '/cart',
// //         pageTitle: 'Your Cart',
// //         products: products
// //       });
// //     })
// //     .catch(err => console.log(err));
// // };

// // exports.postCart = (req, res, next) => {
// //   const prodId = req.params.postId;
// //   const userid = req.userId;
//   // Post.findById(prodId)
//   //   .then(product => {
//   //     return userid.addToCart(product,userid);
//   //   })
//   //   .then(result => {
//   //     console.log(result);
//   //   })
//   //   .catch(err=>
//   //     console.log(err));

//   exports.postCart = (req, res, next) => {
//     const prodId=req.params.prodId;
//     let item;
//     let creator;
//     let qty=1;
//     Post.findById(prodId)
//     .then(prod=>{
//       item=prod;
//       if (!prod) {
//         const error = new Error('Could not find post.');
//         error.statusCode = 404;
//         throw error;
//       }
//       return Cart.find();
//     })
//     .then(items=>{
//       if(items===[]){
//         const cart = new Cart({
//           productId: prodId,
//           userId: req.userId,
//           quantity: qty
//         });
//         cart
//           .save()
//           .then(result => {
//             return User.findById(req.userId);
//           })
//           .then(user => {
//             creator=user;
//             user.cart.push(item);
//             return user.save();
//           })
//           .then(result => {
//             res.status(201).json({
//               message: 'Cart created successfully!',
//               post: item,
//               creator: { _id: creator._id, name: creator.name }
//             });
//           })
//           .catch(err => {
//             if (!err.statusCode) {
//               err.statusCode = 500;
//             }
//             next(err);
//           });
//       }

//       else{
//         const prodId=items.productId;
//         const userId=items.userId;
//         const qty=items.quantity;

//         items.quantity=qty+1;
//         console.log(items);
//         // let arr=items.map((i)=>{
//         //   return i._id.toString();
//         // });
//         // let exists = arr.indexOf(id.toString()) >= 0;
//         // console.log(exists);
    
//         // const x=arr.indexOf(id.toString());
//         // console.log(x);
//       }
//       // const index = items.map((item)=>{
//       //   item._id.toString()===prodId;
//       // });
//     })
//   }

// // };

// });
// let newQuantity = 1;
// const updatedCartItems = [...this.cart.items];

// if (cartProductIndex >= 0) {
//   newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//   updatedCartItems[cartProductIndex].quantity = newQuantity;
// } else {
//   updatedCartItems.push({
//     productId: product._id,
//     userId: userid,
//     quantity: newQuantity
//   });
// }
// const updatedCart = {
//   items: updatedCartItems
// };
// this.cart = updatedCart;
// return this.save();
// };
