const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const StorePayment = require('../../models/seller/StorePayment');
const StoreReview = require('../../models/seller/StoreReview');
const StoreView = require('../../models/seller/StoreView');
const StoreOrder = require('../../models/orders/StoreOrder');
const Order = require('../../models/orders/Order');
const Product = require('../../models/seller/product/Product');
const WithdrawRequest = require('../../models/seller/WithdrawRequest');

const cron = require('node-cron');

cron.schedule('59 23 * * *', () => {
    StorePayment
        .find({
            created_at: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 14),
                $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 13) 
            } 
        })
        .then(payments => {
            const promises = [];
            payments.forEach(payment => promises.push(Store.findOneAndUpdate({_id: payment.store}, {$inc: {credit: payment.amount}}).exec()));
            Promise.all(promises).then(() => console.log('Updated Store Payments')).catch(err => console.log(err));
        })
});

exports.getStore = (req, res, next) => {
    Store.findOne({_id: req.params.id})
    .select('categories subcategories title description page logo reviews')
    .populate('categories')
    .populate({
        path: 'reviews',
        populate: {
            path: 'client',
            select: 'firstName lastName image',
        }
    })
    .then(resp => {
        StorePage.findOne({store: req.params.id})
        .then(page => {
            console.log('the resp is', resp)
            res.json({...resp._doc, page})
        })
    })
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

exports.createStore = (req, res, next) => {
    Store.create(req.body)
    .then(stores => stores.toJSON())
    .then(stores => res.json(stores))
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
    Store.find({categories: req.body.category})
    .select('title description categories logo reviews')
    .sort('title')
    .limit(10)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            store.products = await Product.find({store, category: req.body.category})
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        // console.log('_stores are', _stores)
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
        // await res.json(_stores)
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsByCategoryFull = (req, res, next) => {
    console.log('skipping by ', req.body.skip)
    Store.find({categories: req.body.category, products: { $not: {$size: 0}}})
    .select('title description categories products logo reviews')
    .sort('title')
    .populate({
        path: 'products',
        match: {category: req.body.category, stock: {$gt: 0}},
        select: 'title description discount price currency images options category',
        populate: 'dealOfTheDay',
        sort: 'title.en'
    })
    .skip(req.body.skip)
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
    .select('title description categories logo reviews')
    .sort('title')
    .limit(10)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        console.log('looking for filter', req.body.filter);
        const _stores = stores.map(async store => {
            const match = {store, subcategory}
            if(req.body.filter) match.filter =  req.body.filter;
            store.products = await Product.find(match)
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        // console.log('_stores are', _stores)
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
        // await res.json(_stores)
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsBySubcategoryFull = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    const match = {subcategory: req.body.subcategory._id, stock: {$gt: 0}};
    if(req.body.filter !== '')
        match.filter = req.body.filter;
    console.log(match)
    Store.find({categories: category, products: { $not: {$size: 0}}})
    .select('title description categories products logo')
    .populate({
        path: 'products',
        match,
        select: 'title description discount price currency images options',
        populate: 'dealOfTheDay'
    })
    .skip(req.body.skip)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            const match = {store, subcategory}
            if(req.body.filter) match.filter =  req.body.filter;
            store.products = await Product.find(match)
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        // console.log('_stores are', _stores)
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
        // await res.json(_stores)
    })
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

/* -------------------------------------------------------------------------- */
/*                                    VIEWS                                   */
/* -------------------------------------------------------------------------- */

exports.addView = (req, res, next) => {
    console.log('adding view foooor', req.body);
    const date = new Date();
    StoreView.findOne({
        store: req.body.store, 
        client: req.body.client,
        created_at: {
            $gte: new Date(date.getFullYear(), date.getMonth() - 1, 31),
            $lte: new Date(date.getFullYear(), date.getMonth(), 31) 
        }
    })
    .then(resp => {
        if(resp) return res.json({ok: true})
        else {
            StoreView.create({store: req.body.store, client: req.body.client})
            .then(resp => resp.toJSON())
            .then(resp => console.log('added new view!', resp));
        }
    })
        
}

exports.getViews = (req, res, next) => {
    const date = new Date();
    console.log(date.getFullYear(), date.getMonth() + 1, 31)
    StoreView.countDocuments({store: req.body.store,
        created_at: {
            $gte: new Date(date.getFullYear(), date.getMonth() - 1, 31),
            $lte: new Date(date.getFullYear(), date.getMonth(), 31) 
        }})
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

exports.getOwnProducts = (req, res, next) => {
    const store = req.body.store;
    const criteria = req.params.search || '';
    console.log('store', store, 'criteria', criteria)
    Product.find({store: store._id, $or: [
        {
            "title.en": {$regex: criteria, $options: "i"}
        },
        {
            "title.ar": {$regex: criteria, $options: "i"}
        }
    ]})
    .then(products => res.json(products))
    .catch(err => next(err));
}

exports.getPopularProducts = (req, res, next) => {
    const date = new Date();
    StoreOrder.find({
        store: req.body.store,
        created_at: {
            $gte: new Date(date.getFullYear(), date.getMonth() - 1, 0),
            $lte: new Date(date.getFullYear(), date.getMonth(), 31) 
        }
    }).select('orders')
    .then(orders => {
        const arr = {};
        orders.map(order => {
            order.orders.forEach(order => {arr[order.product] = arr[order.product] ? arr[order.product] + order.quantity : order.quantity});
        })
        let keys = Object.keys(arr);
        keys = keys.slice(0, 4);
        Product.find({_id: {$in: keys}})
        .populate('dealOfTheDay')
        .select('title images')
        .then(products => {
            res.json(products.map(product => ({...product._doc, quantity: arr[product._id]})));
        })
    });
}

exports.getReviews = (req, res, next) => {
    StoreReview.find({store: req.params.store})
    .populate({
        path: 'client',
        select: 'firstName lastName'
    })
    .then(reviews => res.json(reviews))
    .catch(err => next(err));
}

exports.getReviewsOverview = (req, res, next) => {
    StoreReview.find({store: req.params.store})
    .then(reviews => {
        const average = reviews.reduce((total, next) => total + next.stars, 0) / reviews.length;
        res.json({
            average: average || 0,
            number: reviews.length
        });
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

exports.getPerformance = (req, res, next) => {
    const store = req.body.store;
    Store.findOne({_id: store._id})
    .select('performance')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getMonthlySales = (req, res, next) => {
    const date = new Date();
    StorePayment.find({
        store: req.body.store,
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