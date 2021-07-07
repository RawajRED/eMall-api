const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');
const { upload, remove } = require('./s3');

const Variables = require('./models/other/Variables');
const Cities = require('./models/other/Cities');
const Governates = require('./models/other/Governates');
const {getVariables, changeVariables} = require('./variables');
const {getCities, changeCities} = require('./cities');
const {getGovernates, changeGovernates} = require('./governates');


require('dotenv').config();
const app = express();
app.set('secret_key', process.env.SECRET_KEY);
app.options('*', cors());  // enable pre-flight
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Routers
const clientRouter = require('./routes/client/client');
const sellerRouter = require('./routes/seller/seller');
const storeRouter = require('./routes/seller/store');
const productRouter = require('./routes/seller/product/product');
const categoryRouter = require('./routes/categorization/categories')
const subcategoryRouter = require('./routes/categorization/subcategories')
const adminRouter = require('./routes/admin/admin');
const searchRouter = require('./routes/search');
const adsRouter = require('./routes/advertisement');

// Connect to database URL

const mongoose = require('mongoose');
mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
)
.then(async () => {
  console.log('Connection to the database is successful!');
  Variables.findOne({}).then(resp => changeVariables(resp));
  Cities.find({}).then(resp => changeCities(resp));
  Governates.find({}).then(resp => changeGovernates(resp));
});


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
  apis: ["./routes/categorization/categories.js","./routes/categorization/subcategories.js"]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(express.json());
app.use(express.urlencoded({extended: false}))

//Routes
app.use('/api/category', categoryRouter);
app.use('/api/subcategory', subcategoryRouter);
app.use('/api/client', clientRouter);
app.use('/api/admin', adminRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/store', storeRouter);
app.use('/api/product', productRouter);
app.use('/api/search', searchRouter);
app.use('/api/advertisement', adsRouter);

app.post('/api/upload', upload.single('photo'), (req, res) => res.json({location: req.file.Location}));
app.post('/api/upload-multiple', upload.array('photos[]', 10), (req, res) => res.json(req.files.map(file => file.Location)));

app.post('/api/remove', async (req, res) => {
  const key = new URL(req.body.key).pathname.substr(1);
  remove(key)
  .then(() => res.sendStatus(200))
  .catch(err => next(err));
});

app.get('/api/variables', (req, res) => res.json(getVariables()));
app.get('/api/cities', (req, res) => res.json(getCities()));
app.get('/api/governates', (req, res) => res.json(getGovernates()));

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
app.use((req, res, next) => {
  next({status: 404, message: 'Not Found'});
});

// error handler
app.use((err, req, res, next  ) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
