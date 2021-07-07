const Store = require('../../models/seller/Store');
const StorePage = require('../../models/seller/StorePage');
const StorePayment = require('../../models/seller/StorePayment');
const StoreReview = require('../../models/seller/StoreReview');
const StoreView = require('../../models/seller/StoreView');
const StoreOrder = require('../../models/orders/StoreOrder');
const Order = require('../../models/orders/Order');
const Product = require('../../models/seller/product/Product');
const WithdrawRequest = require('../../models/seller/WithdrawRequest');
const Category = require('../../models/categorization/Category');
const SubCategory = require('../../models/categorization/SubCategory');


const cron = require('node-cron');
const { getVariables } = require('../../variables');
const { sendMessage } = require('../../twilio');

cron.schedule('59 23 * * *', () => {
    // StorePayment
    //     .find({
    //         created_at: {
    //             $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 14),
    //             $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 13) 
    //         } 
    //     })
    //     .then(payments => {
    //         const promises = [];
    //         payments.forEach(payment => promises.push(Store.findOneAndUpdate({_id: payment.store}, {$inc: {credit: payment.amount}}).exec()));
    //         Promise.all(promises).catch(err => console.log(err));
    //     })
        StorePayment
        .find({fullfilled:false})
        .populate({path: 'store', select: 'daysTillPaid'})
        .then(payments => {
            const promises = [];
            payments.forEach(payment => 
                {
                    if(payment.created_at <=  new Date(new Date()- payment.store.daysTillPaid * 24 * 60 * 60 * 1000))
                        {
                            promises.push(Store.findOneAndUpdate({_id: payment.store.id}, {$inc: {credit: payment.amount}}).exec());
                            promises.push(StorePayment.findOneAndUpdate({_id: payment._id}, {$set: {fullfilled: true}}).exec());
                        }
                });
            Promise.all(promises).catch(err => console.log(err));
        })
});

exports.getStore = (req, res, next) => {
    Store.findOne({_id: req.params.id, isDeleted : false})
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
            res.json({...resp._doc, page})
        })
    })
    .catch(err => next(err))
}

exports.getStorePage = (req, res, next) => {
    StorePage.findOne({store: req.params.id})
    .populate('homeAds.product')
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.uploadPageImage = (req, res, next) => {
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
    Store.find({categories: req.body.category,isDeleted:false})
    .select('title description categories logo reviews')
    .sort('title')
    .limit(4)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            store.products = await Product.find({store, category: req.body.category, isDeleted : false, isStoreDeleted: false})
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
        // await res.json(_stores)
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsByCategoryFull = (req, res, next) => {
    const category = req.body.category;
    const match = {categories: category, isDeleted: false, title: {$regex: req.body.search, $options: "i"}};
    Store.find(match)
    .select('title description categories products logo reviews')
    .sort('title')
    .skip(req.body.skip)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            store.products = await Product.find({store, category: req.body.category, isDeleted : false, isStoreDeleted: false})
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
        // await res.json(_stores)
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsBySubcategory = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    Store.find({categories: category,isDeleted:false})
    .select('title description categories logo reviews')
    .sort('title')
    .limit(4)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            const match = {store, subcategory, isDeleted:false, isStoreDeleted: false}
            if(req.body.filter) match.filter =  req.body.filter;
            store.products = await Product.find(match)
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getStoreProductsBySubcategoryFull = (req, res, next) => {
    const subcategory = req.body.subcategory;
    const category = subcategory.category;
    Store.find({categories: category, isDeleted: false})
    .select('title description categories logo reviews')
    .sort('title')
    .limit(4)
    .skip(req.body.skip)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            const match = {store, subcategory, isDeleted:false, isStoreDeleted: false}
            if(req.body.filter) match.filter =  req.body.filter;
            store.products = await Product.find(match)
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
    })
    .catch(err => next({status: 404, message: err}));
}

exports.getSimilarStores = (req, res, next) => {
    const arr = req.body.store.categories.map(cat => ({
        categories: cat
    }));
    Store.find({isDeleted:false}).or(arr)
    .populate('categories')
    .select('title categories logo')
    .then(store => res.json(store))
    .catch(err => next(err))
}

exports.findStore = (req, res, next) => {
    const criteria = req.body.criteria;
    Store.find({isDeleted: false, title: {$regex: criteria, $options: "i"}})
    .select('title description categories logo reviews')
    .sort('title')
    .limit(10)
    .skip(req.body.skip)
    .populate('categories')
    .populate({
        path: 'reviews',
        select: 'stars'
    })
    .then(async stores => {
        const _stores = stores.map(async store => {
            const match = {store, isDeleted:false, isStoreDeleted: false}
            store.products = await Product.find(match)
            .select('title description discount price currency images options category extraText extraImage')
            .populate('dealOfTheDay')
            .sort('title.en')
            .limit(5)
            .exec();
            return store;
        })
        Promise.all(_stores).then(resp => {
            res.json(resp)
        });
    })
    .catch(err => next({status: 404, message: err}));

}

exports.getMostPopularStores = (req, res, next) => {
    Store.find({isDeleted:false}).populate('categories')
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
    StorePage.findOneAndUpdate({store: req.body.store._id}, {
        coverImage: req.body.coverImage,
        $set: {homeAds: req.body.homeAds},
         }, {new: true, populate: 'homeAds.product'})
    .then(resp => {
        res.json(resp)
    })
    .catch(err => {
        next(err)
    });
}

/* -------------------------------------------------------------------------- */
/*                                    VIEWS                                   */
/* -------------------------------------------------------------------------- */

exports.addView = (req, res, next) => {
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
            .then(resp => resp.toJSON());
        }
    })
        
}

exports.getViews = (req, res, next) => {
    const date = new Date();
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
    StoreOrder.find({store: store._id, status: req.params.status})
    .sort({created_at: -1})
    .populate('orders.product')
    .then(resp => {
        res.json(resp)
    })
    .catch(err => next(err));
}

exports.getOwnProducts = (req, res, next) => {
    const store = req.body.store;
    const criteria = req.params.search || '';
    Product.find({store: store._id, isDeleted:false, isStoreDeleted: false, $or: [
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
        Product.find({_id: {$in: keys}, isDeleted: false, isStoreDeleted: false})
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
    StoreOrder.findOneAndUpdate({_id: req.body.order, status: {$lte: 1, $gt: -1}}, {status: req.body.status})
    .then(() => {
        res.sendStatus(200);
        Order.findOne({storeOrders: req.body.order})
        .populate({path: 'storeOrders', populate: 'product'})
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
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

exports.cancelOrder = (req, res, next) => {
    StoreOrder.findOneAndUpdate({_id: req.body.order}, {status: -1}, {new: true})
    .populate('store')
    .then(_SO => {
        Order.findOne({storeOrders: req.body.order})
        .populate('client')
        .populate({path: 'storeOrders', populate: 'orders.product'})
        .then(order => {
            let message = '';
            const filter = order.storeOrders.filter(storeOrder => (storeOrder.store.toString() !== req.body.store._id.toString()) && (storeOrder.status > -1));
            
            let total = getVariables().shipping;
            filter.forEach(storeOrder => {
                storeOrder.orders.forEach(order => {
                    const product = order.product;
                    let price = product.price;
                    product.options.map(option => {
                        const pickedOption = order.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                        const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                        price += pick.extraPrice || 0;
                    });
                    total += price * order.quantity * (1 - ((order.discount || 0))) * (1 - ((order.dealOfTheDay || 0) / 100));
                })
            })
            order.total = total;
            message = order.client.languagePref === 0 ? 
            `The store ${_SO.store?.title} has rejected your order, your new total is now ${total} EGP. Please check your current order from the "My Orders" tab`
            :
            `رفض المتجر ${_SO.store?.title} طلبك ، إجمالي المبلغ الجديد هو الآن ${total} جنيه مصري. يرجى التحقق من طلبك الحالي من خلال "طلباتي"`;
            if(checkArrayNotAll(order.storeOrders.map(ord => ord.status), 0)){
                if(!checkArrayNotAll(order.storeOrders.map(ord => ord.status), -1)){
                    // ! CANCEL ENTIRE ORDER
                    message = order.client.languagePref === 0 ?
                    `The store ${_SO.store?.title} has rejected your order. Your order #${order.code} has been cancelled since there is nothing else to be delivered`:
                    `رفض المتجر ${_SO.store?.title} طلبك. تم إلغاء طلبك رقم ${order.code} لأنه لا يوجد شيء آخر ليتم تسليمه`
                    order.status = -1;
                } else {
                    order.status = 1;
                }
            }
            sendMessage(message, order.client.phone)
            .then(() => {
                res.sendStatus(200);
                order.save();
            })
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
            total += price * order.quantity;
            discountedTotal += price * order.quantity * (1 - ((order.discount || 0))) * (1 - ((order.dealOfTheDay || 0) / 100));
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
    const {store, seller} = req.body;
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

exports.getCategory = (req, res, next) => {
    Category.findOne({$or:[{'name.en': req.body.category},{'name.ar': req.body.category}]})
    .select('_id')
    .then( category => {
        next({status:200,category:category});
    })
    .catch(err => next({status: 404, message: err}));
}
exports.getSubCategory = (req, res, next) => {
    SubCategory.findOne({$or:[{'name.en': req.body.subcategory},{'name.ar': req.body.subcategory}]})
    .select('_id')
    .then( subcategory => {
        next({status:200,subcategory:subcategory});
    })
    .catch(err => next({status: 404, message: err}));
}


exports.getStoreId = (req, res, next) => {
    Store.findOne({title: req.body.store})
    .select('_id categories')
    .then( store => {
        next({status:200,store:store});
    })
    .catch(err => next({status: 404, message: err}));
}
