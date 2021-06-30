const Admin = require('../../models/admin/Admin');
const FeaturedProduct = require('../../models/other/FeaturedProduct');
const Order = require('../../models/orders/Order');
const Store = require('../../models/seller/Store');
const Seller = require('../../models/seller/Seller');
const StoreOrder = require('../../models/orders/StoreOrder');
const ClientPayment = require('../../models/client/ClientPayment');
const StorePayment = require('../../models/seller/StorePayment');
const Product = require('../../models/seller/product/Product');
const RefundRequest = require('../../models/orders/RefundRequest');
const Variables = require('../../models/other/Variables');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { changeVariables, getVariables } = require('../../variables');

exports.adminLoginEmail = (req, res, next) => {
    Admin.findOne({email: req.body.email})
    .then(admin => {
        if(admin){
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
                delete admin.password;
                if(err)
                    res.sendStatus(500);
                if(result){
                    const accessToken = jwt.sign({admin}, process.env.SECRET_KEY_ADMIN, { expiresIn: '10h'});
                    const refreshToken = jwt.sign({admin}, process.env.SECRET_KEY_ADMIN, { expiresIn: '3d'});
                    res.json({admin, accessToken, refreshToken})
                }
                else res.sendStatus(404)})
            }
        else res.sendStatus(404)
    })
    .catch(err => {
        res.sendStatus(404)
    })
}

exports.adminLogout = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) { 
        res.json({status:200, success: true, message: 'Logged Out Successfully', token: null });
    } else {
        res.json({ success: false, message: 'Not Logged in' });
    }

}

exports.getApplyingStores = (req, res, next) => {
    Store.find({approved: false, isDeleted: false})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.getDeletedStores = (req, res, next) => {
    Store.find({isDeleted: true})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.approveStore = (req, res, next) => {
    
    var numOfDays = (req.body.numOfDays) ? req.body.numOfDays : 14 ;
    Store.findOneAndUpdate({_id: req.body.id}, {approved: true, daysTillPaid :numOfDays}, {new: true})
    .populate('categories')
    .then(resp => {
        Seller.find({store: req.body.id})
        .select('name title email')
        .then(sellers => {
            res.json({...resp._doc, sellers})
        })
    })
    .catch(err => next(err))
}

exports.getAllStores = (req, res, next) => {
    Store.find({...req.body.ciretia, approved: true, isDeleted: false})
    .populate('categories')
    .then(resp => {
        res.json(resp);
    })
    .catch(err => next(err))
}


exports.getStoreData = (req, res, next) => {
    Store.findOne({_id: req.params.id})
    .populate('categories')
    .then(resp => {
        Seller.find({store: req.params.id})
        .select('name title email')
        .then(sellers => {
            res.json({...resp._doc, sellers})
        })
    })
    .catch(err => next(err))
}

exports.deleteStore = (req, res, next) => {
    Promise.all([
        Store.findOneAndUpdate({_id: req.params.id}, {isDeleted: true}),
        Product.updateMany({store: req.params.id}, {isStoreDeleted: true})
    ])
    .then(() => res.sendStatus(200))
    .catch(err => next(err));
}

exports.revertStore = (req, res, next) => {
    Store.findOneAndUpdate({_id: req.params.id}, {isDeleted: false}, {new: true})
    .then(resp => {
        Product.updateMany({store: req.params.id}, {isStoreDeleted: false});
        Seller.find({store: req.params.id})
        .select('name title email')
        .then(sellers => {
            res.json({...resp._doc, sellers})
        })
    })
    .catch(err => next(err));
}

// * Orders

exports.getReadyOrders = (req, res, next) => {
    Order
        .find({status: req.params.status})
        .populate({path: 'storeOrders', populate: [{path: 'orders.product', select: 'title price'}, {path: 'store', select: 'title logo'}]})
        .populate({path: 'client', select: 'firstName lastName'})
        .then(resp => res.json(resp))
        .catch(err => next(err));
}

exports.changeOrderStatus = (req, res, next) => {
    Order
        .findOneAndUpdate({_id: req.body.id}, {status: req.body.status}, {new: true})
        .then(resp => res.json(resp))
        .catch(err => next(err));
}

exports.fulfillPayment = async (req, res, next) => {
    const order = await Order.findOne({_id: req.body.id}).populate({path: 'storeOrders', populate: 'orders.product'});
    order.status = 5;
    await order.save();
    ClientPayment.create({
        client: order.client,
        order: order._id,
        total: order.total,
        type: 0
    })
    .then(resp => resp.toJSON())
    .then(payment => {
        const payments = order.storeOrders.map(storeOrder => {
            // !Calculate Total for each order
            let total = 0;
            storeOrder.orders.forEach(order => {
                const product = order.product;
                let price = product.price;
                product.options.map(option => {
                    const pickedOption = order.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                    const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                    price += pick.extraPrice || 0;
                });
                total += price * (1 - ((order.discount || 0))) * (1 - ((order.dealOfTheDay || 0) / 100));
            })
            return [StorePayment.create({store: storeOrder.store, client: order.client, storeOrder: storeOrder._id, amount: total}),
                    StoreOrder.findOneAndUpdate({_id: storeOrder._id}, {status: 5})]
        }).flat();

        Promise.all(payments)
        .then(resp => {
            res.json({msg: 'Task completed!', resp})
        })
    })
}

exports.wipeOrders = (req, res, next) => {
    Order.deleteMany({})
    .then(() => {
        StoreOrder.deleteMany({})
        .then(() => res.json({resp: 'Bye Bye Orders :('}))
    })
}

/* -------------------------------------------------------------------------- */
/*                                   REFUNDS                                  */
/* -------------------------------------------------------------------------- */

exports.getRefunds = (req, res, next) => {
    RefundRequest.find({status: req.params.status})
    .populate({
        path: 'client',
        select: 'firstName lastName email phone'
    })
    .populate({path: 'order', populate: 'address '})
    .populate({path: 'storeOrders.storeOrder', populate: 'orders.product'})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.confirmRefund = (req, res, next) => {
    RefundRequest.findOneAndUpdate({_id: req.body.id}, {status: 1}, {new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.completeRefund = (req, res, next) => {
    RefundRequest.findOneAndUpdate({_id: req.body.id}, {status: 2}, {new: true})
    .populate({
        path: 'client',
        select: 'firstName lastName email phone'
    })
    .populate({path: 'order', populate: 'address '})
    .populate({path: 'storeOrders.storeOrder', populate: 'orders.product'})
    .then(resp => {
        Promise.all([
            ClientPayment()
        ])
        res.json(resp)
    })
    .catch(err => next(err));
}

// * Variables

exports.changeVariables = (req, res, next) => {
    Variables.findOneAndUpdate({}, req.body, {upsert: true, new: true})
    .then(resp => {
        changeVariables(resp);
        res.json(resp);
    })
    .catch(err => next(err));
}

// * Featured Products

exports.getFeaturedProducts = (req, res, next) => {
    FeaturedProduct.find({})
    .populate({
        path: 'product',
        populate: 'store'
    })
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.addFeaturedProducts = (req, res ,next) => {
    FeaturedProduct.create(req.body.products.map(prod => ({product: prod})))
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.removeFeaturedProduct = (req, res, next) => {
    FeaturedProduct.findOneAndDelete({_id: req.query.id})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.searchProducts = (req, res, next) => {
    const criteria = req.body.search || '';
    Product.find({isStoreDeleted: false, isDeleted: false, $or: [
        {
            "title.en": {$regex: criteria, $options: "i"}
        },
        {
            "title.ar": {$regex: criteria, $options: "i"}
        }
    ]})
    .populate('store')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.createNewAdmin = (req, res, next) => {
    const password = req.body.password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        Admin.create({email: req.body.email, password: hash})
        .then(resp => res.sendStatus(200))
        .catch(err => next(err));
    }
    )
}


// exports.getFinanceOverview = (req, res, next) => {



// }