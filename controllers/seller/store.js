const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const Product = require('../../models/seller/product/Product');
const Category = require('../../models/categorization/Category');

exports.getStore = (req, res, next) => {
    Store.findOne({_id: req.params.id})
    .select('categories subcategories title description page logo reviews')
    .populate('categories')
    .populate('page')
    .populate({
        path: 'reviews',
        populate: {
            path: 'client',
            select: 'firstName lastName image',
        }
    })
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.updateStore = (req, res, next) => {
    Store.findOneAndUpdate({_id: req.body._id}, req.body.details, {new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.getStoreProductsByCategory = (req, res, next) => {
    Store.find({categories: req.body.category})
    .select('title description categories products logo')
    .populate({
        path: 'products',
        match: {category: req.body.category, stock: {$gt: 0}},
        select: 'title description discount price currency images options'
    })
    .populate('categories')
    .then(store => res.json(store))
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsBySubcategory = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    Store.find({categories: category})
    .select('title description categories products logo')
    .populate({
        path: 'products',
        match: {subcategory: req.body.subcategory, stock: {$gt: 0}},
        select: 'title description discount price currency images options'
    })
    .populate('categories')
    .then(store => res.json(store))
    .catch(err => next({status: 404, message: 'No Stores Found'}));
}

exports.getSimilarStores = (req, res, next) => {
    const arr = req.body.store.categories.map(cat => ({
        categories: cat
    }));
    Store.find().or(arr)
    .populate('categories')
    .select('title categories')
    .then(store => res.json(store))
    .catch(err => next(err))
}

exports.getMostPopularStores = (req, res, next) => {
    Store.find().populate('categories')
    .then(store => res.json(store))
    .catch(err => next(err))
}

exports.createStorePage = (req, res, next) => {
    StorePage.create({store: req.body._id})
    .then(resp => resp.toJSON())
    .then(page => {
        Store.findOneAndUpdate({_id: req.body._id}, {page: page._id}, {new: true})
        .then(resp => res.json(resp))
        .catch(err => next(err))
    })
    .catch(err => next({status: 403, message: 'Store page with that key already exists'}));
}

exports.updateStorePage = (req, res, next) => {
    console.log(req.body.page);
    StorePage.findOneAndUpdate({store: req.body.store}, req.body.page, {new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}