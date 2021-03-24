const ProductVariant = require('../../../models/seller/product/ProductVariant');
const Product = require('../../../models/seller/product/Product');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Product Variants
exports.getProductVariant = (req, res, next) => {
    ProductVariant.findOne({_id: req.params.id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err));    
}

exports.getVariant = (req, res, next) => {
    console.log('getting vars')
    Product.findOne({_id: req.params.id})
    .then(prod => {
        ProductVariant.findOne({_id: prod.variants})
        .populate('products.product')
        .then(resp => res.json(resp));
    })
    .catch(err => next(err));
}

exports.createProductVariant = (req, res, next) => {
    const product = req.body.product;
    const title = {
        en: req.body.title.en,
        ar: req.body.title.ar
    };
    const variant = {
        en: req.body.variant.en,
        ar: req.body.variant.ar
    }
    ProductVariant.create({title, products: [{product, variant}]})
    .then(resp => resp.toJSON())
    .then(resp => {
        Product.findOneAndUpdate({_id: product}, {variants: resp._id}, {new: true})
        .then(prod => {
            res.json({variant: resp, product: prod})
        })
    })
    .catch(err => next(err));
}

exports.sms = (req, res, next) => {
    console.log(accountSid, authToken);
    client.messages
  .create({
     body: 'Your verification code is AFDQL',
     from: '+12255290371',
     to: '+201140008042'
   })
  .then(message => console.log(message  ))
  .catch(err => next(err));
}