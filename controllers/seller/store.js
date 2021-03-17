const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const StorePayment = require('../../models/seller/StorePayment');
const StoreOrder = require('../../models/orders/StoreOrder');
const Order = require('../../models/orders/Order');
const WithdrawRequest = require('../../models/seller/WithdrawRequest');
// const StorePayments = require('../../models/');
const cron = require('node-cron');
const { Timestamp } = require('bson');

// cron.schedule('0 0 0 * * *', () => {

// })

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

exports.uploadPageImage = (req, res, next) => {
    console.log('file', req.file, req.body);
    res.json({ayy: 'lmao'})
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
    const match = {subcategory: req.body.subcategory, stock: {$gt: 0}};
    if(req.body.filter)
        match.filter = req.body.filter;
    console.log('match is', match)
    Store.find({categories: category, products: { $not: {$size: 0}}})
    .select('title description categories products logo')
    .populate({
        path: 'products',
        match,
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
    .select('title categories logo')
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
    console.log(req.body);
    StorePage.findOneAndUpdate({store: req.body.store._id}, {
        coverImage: req.body.coverImage,
        $set: {homeAds: req.body.homeAds},
         }, {new: true, populate: 'homeAds.product'})
    .then(resp => {
        console.log('well, resp is', resp)
        res.json(resp)
    })
    .catch(err => {
        console.log('your err sir. is', err)
        next(err)
    });
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
    StoreOrder.findOneAndUpdate({_id: req.body.order, status: {$lte: 1, $gt: -1}}, {status: req.body.status})
    .then(() => {
        StoreOrder.find({store: store._id})
        .sort('status')
        .populate('orders.product')
        .then(resp => {
            res.json(resp);
            Order.findOne({storeOrders: req.body.order})
            .populate('storeOrders')
            .then(order => {
                if(checkArrayNotAll(order.storeOrders.map(ord => ord.status), 0)){
                    if(!checkArrayNotAll(order.storeOrders.map(ord => ord.status), -1)){
                        // ! CANCEL ENTIRE ORDER
                        order.status = -1;
                        order.save();
                    } else {
                        order.status = 1;
                        order.save();
                    }
                }
            })
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
            discountedTotal += price * (1 - ((order.discount || 0))) * (1 - ((order.dealOfTheDay || 0) / 100));
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

exports.getMonthlySales = (req, res, next) => {
    const date = new Date();
    console.log('ayy im getting it', date)
    StorePayment.find({
        created_at: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), 31) 
        }
    })
    .then(payments => {
        const result = payments.reduce((elem, next) => elem + next.amount, 0).toFixed(2);
        res.json({result})
    });
}

exports.getPreviousSales = (req, res, next) => {
    const date = new Date();
    console.log('ayy im getting it', date)
    const payments = [
        StorePayment.find({
            store: req.body.store,
            created_at: {
                $gte: new Date(date.getFullYear(), date.getMonth() - 2, 0),
                $lte: new Date(date.getFullYear(), date.getMonth() - 2, 31) 
            }
        }),
        StorePayment.find({
            store: req.body.store,
            created_at: {
                $gte: new Date(date.getFullYear(), date.getMonth() - 1, 0),
                $lte: new Date(date.getFullYear(), date.getMonth() - 1, 31) 
            }
        }),
        StorePayment.find({
            store: req.body.store,
            created_at: {
                $gte: new Date(date.getFullYear(), date.getMonth(), 0),
                $lte: new Date(date.getFullYear(), date.getMonth(), 31) 
            }
        })
    ];
    Promise.all(payments)
    .then(payments => {
        res.json(payments)
    });
}

exports.getPendingFunds = (req, res, next) => {
    const date = new Date();
    console.log('ayy im getting it', date)
    StorePayment.find({
        store: req.body.store,
        created_at: {
            $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 14),
            $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate()+1) 
        }
    })
    .then(payments => {
        const result = payments.reduce((elem, next) => elem + next.amount, 0).toFixed(2);
        res.json({result})
    });
}

exports.requestWithdrawal = (req, res, next) => {
    const {store, seller, amount} = req.body;
    WithdrawRequest.findOneAndUpdate(
        {store: store._id, seller: seller._id, fulfilled: false},
        {store: store._id, seller: seller._id},
        {upsert: true, setDefaultsOnInsert: true, new: true}
    )
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getPayments = (req, res, next) => {
    StorePayment
        .find({store: req.body.store})
        .populate('storeOrder')
        .then(resp => res.json(resp))
        .catch(err => next(err));
}

const checkArrayNotAll = (array, number) => {
    return array.reduce((elem, next) => elem && (next !== number), true);
}