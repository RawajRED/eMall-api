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
    Product.findOne({_id: req.params.id,isDeleted : false})
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
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

exports.updateProductVariant = async (req, res, next) => {
    const variantId = req.body.variantId;
    const newVariant = {en: req.body.variant.en, ar: req.body.variant.ar};
    const newProduct = req.body.product;
    const variants = await ProductVariant.findOne({_id: req.body._id});
    variants.products = variants.products.map(product => {
        if(product._id.toString() === variantId){
            product.product = newProduct;
            product.variant = newVariant;
        }
        return product;
    });
    variants.save();
    ProductVariant.updateOne({_id: variants._id}, variants)
    .then(resp => res.json({resp}))
    .catch(err => next(err));
}

exports.addProductToVariant = (req, res, next) => {
    const newVariant = {en: req.body.variant.en, ar: req.body.variant.ar};
    const newProduct = req.body.product;
    ProductVariant.findOneAndUpdate({_id: req.body._id}, {$push: {products: {
        product: newProduct,
        variant: newVariant 
    }}}, {new: true})
    .then(resp => {
        Product.findOneAndUpdate({_id: newProduct}, {variants: resp._id}, {new: true})
        .then(resp => res.json({success: true}))
    })
    .catch(err => next(err));
}

exports.removeProductVariant = async (req, res, next) => {
    const variantId = req.body.variantId;
    const variants = await ProductVariant.findOne({_id: req.body._id});
    variants.products = variants.products.filter(product => {
        if(product._id.toString() !== variantId)
            return product;
        else Product.findOneAndUpdate({_id: product.product}, {$unset: {variants: 1}});
    });
    if(variants.products.length > 0){
        variants.save();
        ProductVariant.updateOne({_id: variants._id}, variants)
        .then(resp => res.json({resp}))
        .catch(err => next(err));
    } else {
        ProductVariant.findOneAndDelete({_id: variants._id})
        .then(resp => res.json(resp))
        .catch(err => next(err));
    }
}

exports.sms = (req, res, next) => {
    client.messages
    .create({
        body: 'Your verification code is AFDQL',
        from: '+12255290371',
        to: '+201140008042'
    })
    .then(message => console.log(message))
    .catch(err => next(err));
}

exports.getProductVariants = (req, res, next) => {
    ProductVariant.findOne({'products.product': req.params.product})
    .populate({path: 'products.product', match : {isDeleted : false }, select: 'title images'})
    .then(variants => {
        res.json(variants);
    })
}