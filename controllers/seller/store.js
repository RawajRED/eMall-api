const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const Product = require('../../models/seller/product/Product');
const Order = require('../../models/orders/Order');
const StoreOrder = require('../../models/orders/StoreOrder');
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

exports.getStorePage = (req, res, next) => {
    console.log(req.params)
    StorePage.findOne({store: req.params.id})
    .populate('homeAds.product')
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

exports.getOrders = (req, res, next) => {
    const store = req.body.store;
    StoreOrder.find({store: store._id})
    .populate('order')
    .sort('status')
    .populate('order.orders.product')
    .then(resp => {
        res.json(resp)
    })
    .catch(err => next(err));
    // resp.orders = resp.orders.filter(option => option.product.store === store._id);
        
}

exports.getOrderProducts = (req, res, next) => {
    Order.findOne({_id: req.body.order})
    .populate('orders')
    .select('orders')
    .then(resp => res.json(resp));
}

exports.updateOrder = (req, res, next) => {
    const store = req.body.store;
    console.log(`Updating store ${store._id}, with order ${req.body.order}, and status ${req.body.status}`)

    Order.findOneAndUpdate({$and: [{'stores.id': store._id}, {_id: req.body.order}]})
    .then(resp => {
        Order.find({'stores.id': store._id})
        .sort('status')
        .populate('orders.product')
        .then(orders => res.json(orders))
        .catch(err => next(err));
    })
    .catch(err => next(err));

    // Order.updateMany({$and: [{stores: store._id}, {_id: req.body.order}]}, {status: req.body.status})
    // .then(resp => {
    //     console.log('Congrats champ!, new order is', resp)
    //     Order.find({stores: store._id})
    //     .sort('status')
    //     .populate('orders.product')
    //     .then(orders => res.json(orders));
    //     })
    // .catch(err => next(err));
}

exports.getRevenueForOrder = (req, res, next) => {
    const store = req.body.store;
    console.log(req.body)
    Order.findOne({_id: req.body.order, 'stores.id': store._id})
    .populate('orders.product')
    .then(resp => {
        if(!resp) return res.json({total: 0})
        let total = 0;
        resp.orders.filter(order => {
            const product = order.product;
            let price = product.price;
            product.options.map(option => {
                const pickedOption = order.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                price += pick.extraPrice || 0;
            })
            total += price;
        })
        res.json({total})
    })
    .catch(err => next(err));
}