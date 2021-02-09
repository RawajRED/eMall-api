const ProductVariant = require('../../../models/seller/product/ProductVariant');

// Product Variants
exports.getProductVariant = (req, res, next) => {
    ProductVariant.findOne({_id: req.params.id})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
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
    .then(resp => res.json(resp))
    .catch(err => next(err));
}