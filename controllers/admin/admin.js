const Admin = require('../../models/admin/Admin');
const FeaturedProduct = require('../../models/other/FeaturedProduct');
const Order = require('../../models/orders/Order');
const StoreOrder = require('../../models/orders/StoreOrder');
const ClientPayment = require('../../models/client/ClientPayment');
const StorePayment = require('../../models/seller/StorePayment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.adminLoginUsername = (req, res, next) => {
    Admin.findOne({username: req.body.username})
    .then(resp => resp.toJSON())
    .then(admin => {
        if(admin){
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
                delete admin.password;
                if(err)
                    return next({status: 500, message: 'Internal Server Error, token unverifiable'});
                if(result){
                const token = jwt.sign({admin},"%]dh^u2))d]v)w{d*IGj6S79h~tr|-O!y~_/8g=(UZ}OJKm!|fl6.$3F(827Zw<", { expiresIn: '1d'});
                next(res.json({status :200, admin, token}))
                }
                else next({message: 'Incorrect Password', status: 401});})
            }
        else next({status: 404, message: 'Username not found'})
    })
    .catch(err => {console.log(err);next({status: 400, message: 'Username not found'})})
}

exports.adminLogout = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) { 
        res.json({status:200, success: true, message: 'Logged Out Successfully', token: null });
    } else {
        res.json({ success: false, message: 'Not Logged in' });
    }

}

exports.addFeaturedProduct = (req, res, next) => {
    FeaturedProduct.create({product: req.body.product})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp));
}

exports.removeFeaturedProduct = (req, res, next) => {
    FeaturedProduct.findOneAndDelete({product: req.body.product})
    .then(resp => res.json(resp));
}

exports.getReadyOrders = (req, res, next) => {
    Order
        .find({status: req.params.status})
        .populate('storeOrders')
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
            console.log(resp);
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