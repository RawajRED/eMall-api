const Product = require('../../../models/seller/product/Product');
const ProductVariant = require('../../../models/seller/product/ProductVariant');

exports.createProduct = (req, res, next) => {
    const product = req.body.product;
    const variant = req.body.variant;
    Product.create(product)
    .then(resp => resp.toJSON())
    .then(prod => {
        if(variant){
            ProductVariant.findOneAndUpdate({_id : variant.id}, {$push: {products: {product: prod._id, variant: variant.variant}}}, {new: true})
            .then(resp => {
                Product.findOneAndUpdate({_id: prod._id}, {variants: resp._id}, {new: true})
                .then(finalProduct => res.json({product: finalProduct, variants: resp}))
            })
        }
        else res.json(prod)
    })
    .catch(err => next(err));
}


exports.getProductById = (req, res, next) => {
    Product.findOne({_id: req.params.id})
    .populate({
        path: 'store',
        select: 'logo title categories'
    })
    .populate({
        path: 'reviews',
        populate: {
            path: 'client',
            select: 'firstName lastName image'
        }
    })
    .populate('variants')
    .then(resp => {
        if(!resp)
            return next({status: 404, message: 'Product not found'})
        else return res.json(resp)
    })
    .catch(err => next(err))
}

exports.getMoreFromSeller = (req, res, next) => {
    const product = req.body;
    Product.find({$or: [
        {subcategory: product.subcategory, store: product.store, _id: {$ne: product._id}},
        {category: product.category, store: product.store, _id: {$ne: product._id}},
        {store: product.store, _id: {$ne: product._id}}
    ]})
    .limit(10)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getSimilarProducts = (req, res, next) => {
    const product = req.body.product;
    Product.find({$or: [
        {category: product.category, store: product.store},
        {category: product.category},
        {subcategory: product.subcategory}
    ]})
    .limit(10)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.findProduct = (req, res, next) => {
    Product.find(req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.updateProduct = (req, res, next) => {
    Product.findOneAndUpdate({_id: req.body._id}, req.body, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: "Couldn't find the specificed Product"}))
    .catch(err => next(err));
}

exports.deleteProduct = (req, res, next) => {
    Product.remove(req.body)
    .then(resp => res.json(resp))
    .catch(err => next({status: 500, message: 'Internal Server Error'}))
}