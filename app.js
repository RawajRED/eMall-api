
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

require('dotenv').config();
const app = express();
app.set('secret_key', process.env.SECRET_KEY);

// Routers
const categoryRouter = require('./routes/categorization/categories')
const subcategoryRouter = require('./routes/categorization/subcategories')


// Connect to database URL
const mongoose = require('mongoose');
mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => console.log('Connection to the database successful'));


// Setup SwaggerUI
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'eMall API',
      description: "Information for the eMall Web Application API",
      contact: {
        name: "Asser Hamad",
      },
      servers: [`http://localhost:${process.env.PORT}`]
    }
  },
  apis: ["./routes/categorization/categories.js"]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);


//Routes
app.use('/api/categories', categoryRouter);
app.use('/api/subcategories', subcategoryRouter);

app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs)
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
