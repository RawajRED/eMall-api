const Store = require('../../models/seller/Store');
const Product = require('../../models/seller/product/Product');
const Category = require('../../models/categorization/Category');

exports.getStoreProductsByCategory = (req, res, next) => {
    Store.find({categories: req.body.category})
    .select('title description categories products')
    .populate({
        path: 'products',
        match: {category: req.body.category, stock: {$gt: 0}},
        select: 'title description discount price currency images options'
    })
    .populate('categories')
    .then(store => res.json(store))
    .catch(err => next({status: 404, message: 'No Stores Found'}));
}

exports.getStoreProductsBySubcategory = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    Store.find({categories: category})
    .select('title description categories products')
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