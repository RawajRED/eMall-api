const Product = require('../../../models/seller/product/Product');
const Store = require('../../../models/seller/Store');
const ProductVariant = require('../../../models/seller/product/ProductVariant');
const ProductReview = require('../../../models/seller/product/ProductReview');

exports.createProduct = (req, res, next) => {
    const product = req.body.product;
    product.store = req.body.store._id;
    const variant = req.body.variant;
    console.log(req.body);
    Product.create(product)
    .then(resp => resp.toJSON())
    .then(prod => {
        
    Store.updateOne({_id: prod.store}, {$push: {products: prod._id}})
    .then(resp => {
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
    .populate('dealOfTheDay')
    .then(resp => {
        if(!resp)
            return next({status: 404, message: 'Product not found'})
        else return res.json(resp)
    })
    .catch(err => next(err))
}

exports.findByCategory = (req, res ,next) => {
    console.log('umm yo?')
    const category = req.body.id;
    const match = {category};
    if(req.body.filter !== '')
        match.filter = req.body.filter;
    Product.find(match)
    .populate('dealOfTheDay')
    .then(products => res.json(products))
    .catch(err => next(err)); 
}

exports.findBySubcategory = (req, res, next) => {
    const subcategory = req.body.id;
    const filter = req.body.filter !== '' ? req.body.filter : undefined;
    console.log('subcategory: ', subcategory)
    Product.find({subcategory, filter})
    .populate('dealOfTheDay')
    .then(products => res.json(products))
    .catch(err => next(err)); 
}

exports.getMoreFromSeller = (req, res, next) => {
    const product = req.body;
    Product.find({$or: [
        {subcategory: product.subcategory, store: product.store, _id: {$ne: product._id}},
        {category: product.category, store: product.store, _id: {$ne: product._id}},
        {store: product.store, _id: {$ne: product._id}}
    ]})
    .populate('dealOfTheDay')
    .limit(10)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getDeals = (req, res, next) => {
    console.log('getting deals')
    Product.find({discount: {$gt: 0}}).sort({updated_at: 1})
    .populate('dealOfTheDay')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getReviews = (req, res, next) => {
    const product = req.params.product;
    ProductReview.find({product})
    .populate({path: 'client', select: 'firstName lastName'})
    .then(review => res.json(review))
    .catch(err => next(err));
}

exports.getSimilarProducts = (req, res, next) => {
    const product = req.body.product;
    Product.find({$or: [
        {category: product.category, store: product.store},
        {category: product.category},
        {subcategory: product.subcategory}
    ]})
    .populate('dealOfTheDay')
    .limit(10)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getStoreProducts = (req, res, next) => {
    console.log('getting store param shit', req.params.id)
    Product.find({store: req.params.id})
    .populate('dealOfTheDay')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.findProduct = (req, res, next) => {
    const criteria = req.body.criteria;
    Product.find({$or: [
        {
            "title.en": {$regex: criteria, $options: "i"}
        },
        {
            "title.ar": {$regex: criteria, $options: "i"}
        }
    ]})
    .populate('store')
    .populate('dealOfTheDay')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.updateProduct = (req, res, next) => {
    console.log(' o hi maerk')
    Product.findOneAndUpdate({_id: req.body.product._id}, req.body.product, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: "Couldn't find the specificed Product"}))
    .catch(err => next(err));
}

exports.updateProductOptions = (req, res, next) => {
    Product.findOneAndUpdate({_id: req.body.product._id}, req.body.product, {new: true})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: "Couldn't find the specificed Product"}))
    .catch(err => next(err));
}

exports.addProductOptionsAddParam = (req, res, next) => {
    console.log('id', req.body.optionId, 'options', req.body.option)
    Product.findOneAndUpdate({'options._id': req.body.optionId}, {$push: {'options.$[element].options': req.body.option}}, {new: true, arrayFilters: [{'element._id': req.body.optionId}]})
    .then(resp => resp ? res.json(resp) : next({status: 404, message: "Couldn't find the specificed Product"}))
    .catch(err => next(err));
}

exports.updateProductOptionsAddParam = async (req, res, next) => {
    // console.log('id', req.body.optionId, 'innerOption', req.body.innerOptionId, 'options', req.body.option)
    const product = await Product.findOne({_id: req.body.productId});
    // console.log(product.options)
    product.options = product.options.map(option => {
        if(option._id.toString() === req.body.optionId){
            option.options.map(option => {
                if(option._id.toString() === req.body.innerOptionId){
                    option.title.en = req.body.option.title.en;
                    option.title.ar = req.body.option.title.ar;
                    option.stock = req.body.option.stock;
                    option.extraPrice = req.body.option.extraPrice;
                    console.log(option)
                }
                return option;
            })
        }
        return option;
    })
    product.save();
    Product.updateOne({_id: product._id}, product)
    .then(resp => res.json({resp}))
    .catch(err => next(err));

    // Product.findOneAndUpdate({'options._id': req.body.optionId}, {$set: {'options.$[element].options': req.body.option}}, {new: true, arrayFilters: [{'element._id': req.body.optionId}]})
    // .then(resp => resp ? res.json(resp) : next({status: 404, message: "Couldn't find the specificed Product"}))
    // .catch(err => next(err));
}

exports.deleteProduct = (req, res, next) => {
    Product.remove(req.body)
    .then(resp => res.json(resp))
    .catch(err => next({status: 500, message: 'Internal Server Error'}))
}