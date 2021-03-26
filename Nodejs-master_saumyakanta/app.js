const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const path = require('path');
const bodyParser = require('body-parser');

const sequelize = require('./util/database'); // database initialization
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


const apiRouter = require('./routes/api_route');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const {
  DB_HOST: db_host,
  DB_NAME: db_name,
  COOKIE_AUTH: cookie_auth,
  TOKEN_AUTH: token_auth,
  SECRET_KEY: secret,
  API_BASE_URL: api_base_url
} = process.env;

if (cookie_auth == 'true') {
  var session = require("express-session");
  var MongoStore = require('connect-mongo')(session);
}

const app = express();

// app.use(express.static('public'));
// app.use(cors());
// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//----------------------------database associations--------------------------------------
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
//---------------------------------------------------------------------------------------

sequelize
  //.sync({ force: true })
  .sync()
  .then(cart => {
    console.log("connected through sequelize");
    //app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });

// mongoose.connect(`mongodb://${db_host}/${db_name}`,{useNewUrlParser: true,useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
// const db = mongoose.connection;

// db.on('connected', function() {
//   console.log('Database connected successfully');
// });

// db.on('error', function(err) {
//   console.log('Error occured during database connection');
// });

if (cookie_auth == 'true') {
  app.use(cookieParser());
  app.use(session({
      store: new MongoStore({
          url: `mongodb://${db_host}/${db_name}`,
      }),
      cookie: { maxAge: 1 * 60 * 60 * 1000 },
      secret: secret,
      resave: false,
      saveUninitialized: false
  }));
}

app.use(passport.initialize());
if (cookie_auth == 'true') {
  app.use(passport.session());
}

if (token_auth == 'true') {
  require('./passport-configs/passport-jwt-config')(passport);
}
if (cookie_auth == 'true') {
  require('./passport-configs/passport-local-config')(passport);
}

//----------------------------middlewares request funnels-------------------------------------
//app.use(api_base_url, apiRouter);
app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);
//--------------------------------------------------------------------------------------------

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// TODO Web Template Studio: Add your own error handler here.
if (process.env.NODE_ENV === "production") {
  // Do not send stack trace of error message when in production
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send("Error occurred while handling the request.");
  });
} else {
  // Log stack trace of error message while in development
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.send(err.message);
  });
}

module.exports = app;
