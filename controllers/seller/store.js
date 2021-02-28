const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const StoreOrder = require('../../models/orders/StoreOrder');
const WithdrawRequest = require('../../models/seller/WithdrawRequest');

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

// exports.getStoreProducts = (req, res, next) => {
//     const criteria = req.body.criteria;
//     Store.find({$or: [{categories: req.body.category, products: { $not: {$size: 0}}})
//     .select('title description categories products logo reviews')
//     .populate({
//         path: 'products',
//         match: {category: req.body.category, stock: {$gt: 0}},
//         select: 'title description discount price currency images options category',
//         populate: 'dealOfTheDay'
//     })
//     .populate('categories')
//     .populate({
//         path: 'reviews',
//         select: 'stars'
//     })
//     .then(store => res.json(store))
//     .catch(err => next({status: 404, message: err}));
// }

exports.getStoreProductsByCategory = (req, res, next) => {
    console.log('category', req.body.category);
    Store.find({categories: req.body.category, products: { $not: {$size: 0}}})
    .select('title description categories products logo reviews')
    .populate({
        path: 'products',
        match: {category: req.body.category, stock: {$gt: 0}},
        select: 'title description discount price currency images options category',
        populate: 'dealOfTheDay'
    })
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(store => res.json(store))
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsBySubcategory = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    Store.find({categories: category, products: { $not: {$size: 0}}})
    .select('title description categories products logo')
    .populate({
        path: 'products',
        match: {subcategory: req.body.subcategory, stock: {$gt: 0}},
        select: 'title description discount price currency images options',
        populate: 'dealOfTheDay'
    })
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
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
    .sort('status')
    .populate('orders.product')
    .then(resp => {
        res.json(resp)
    })
    .catch(err => next(err));
}

exports.updateOrderStatus = (req, res, next) => {
    const store = req.body.store;
    console.log(req.body.order, req.body.status)
    StoreOrder.findOne({_id: req.body.order})
    .then(resp => {
        console.log(resp.status)
        if(resp.status !== 0 && resp.status !== 1)
            return next({status: 403, message: 'Order cannot be altered any further'})
        StoreOrder.findOneAndUpdate({_id: req.body.order}, {status: req.body.status})
        .then(() => {
            StoreOrder.find({store: store._id})
            .sort('status')
            .populate('orders.product')
            .then(resp => res.json(resp))
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

exports.getRevenueForOrder = (req, res, next) => {
    const store = req.body.store;
    StoreOrder.findOne({store: store._id, _id: req.body.order})
    .populate('orders.product')
    .then(resp => {
        if(!resp) return res.json({total: 0});
        
        let total = 0;
        let discountedTotal = 0;
        resp.orders.filter(order => {
            const product = order.product;
            let price = product.price;
            product.options.map(option => {
                const pickedOption = order.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                price += pick.extraPrice || 0;
            });
            total += price;
            discountedTotal += price * (1 - ((order.discount || 0) / 100));
        })
        res.json({total: total.toFixed(2), discountedTotal: discountedTotal.toFixed(2)})
    })
    .catch(err => next(err));
}

exports.getCredit = (req, res, next) => {
    const store = req.body.store;
    Store.findOne({_id: store._id})
    .select('credit')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.requestWithdrawal = (req, res, next) => {
    const {store, seller, amount} = req.body;
    WithdrawRequest.findOneAndUpdate(
        {store: store._id, seller: seller._id, fulfilled: false},
        {store: store._id, seller: seller._id, amount},
        {upsert: true, setDefaultsOnInsert: true, new: true}
    )
    .then(resp => res.json(resp))
    .catch(err => next(err));
}