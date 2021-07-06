const Admin = require('../../models/admin/Admin');
const FeaturedProduct = require('../../models/other/FeaturedProduct');
const FeaturedStore = require('../../models/other/FeaturedStore');
const Order = require('../../models/orders/Order');
const Store = require('../../models/seller/Store');
const Seller = require('../../models/seller/Seller');
const StoreOrder = require('../../models/orders/StoreOrder');
const ClientPayment = require('../../models/client/ClientPayment');
const StorePayment = require('../../models/seller/StorePayment');
const Product = require('../../models/seller/product/Product');
const WithdrawRequest = require('../../models/seller/WithdrawRequest');
const RefundRequest = require('../../models/orders/RefundRequest');
const Variables = require('../../models/other/Variables');
const Cities = require('../../models/other/Cities');
const Governate = require('../../models/other/Governates');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { changeVariables } = require('../../variables');
const { changeCities } = require('../../cities');
const { changeGovernates } = require('../../governates');

exports.adminLoginEmail = (req, res, next) => {
    Admin.findOne({email: req.body.email}).select('+password')
    .then(admin => {
        if(admin){
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
                delete admin.password;
                console.log(admin);
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

exports.addPendingCredit = (req, res, next) => {
    StorePayment
    .find({store : req.params.id, fullfilled : false})
    .then(payments => {
        const promises = [];
        payments.forEach(payment => 
            {
                promises.push(Store.findOneAndUpdate({_id: req.params.id}, {$inc: {credit: payment.amount}}).exec());
                promises.push(StorePayment.findOneAndUpdate({_id: payment._id}, {$set: {fullfilled: true}}).exec());
            });
        Promise.all(promises)
        .then(resp => res.status(200).json({message:"pending funds added successfully !!"}))
        .catch(err => console.log(err));
    })
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
        .populate({path: 'storeOrders', populate: [{path: 'orders.product' ,select : 'title description reviews images category discount stock price options'}, {path: 'store', select : 'title logo reviews sellers'}]})
        .populate({path: 'client', select :'firstName lastName email phone'})
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

exports.getFullOrder = (req, res, next) => {
    Order.findOne({_id: req.params.id})
    .populate({path: 'storeOrders', populate: 'store orders.product'})
    .populate({path: 'client', select: 'firstName lastName phone email'})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                                Store Orders                                */
/* -------------------------------------------------------------------------- */

exports.changeStoreOrderStatus = (req, res, next) => {
    StoreOrder.findOneAndUpdate({_id: req.params.id}, {status: req.body.status}, {new: true})
    .then(storeOrder => {
        console.log(storeOrder)
        Order.findOne({storeOrders: req.params.id})
        .populate({path: 'storeOrders', populate: 'store orders.product'})
        .populate({path: 'client', select: 'firstName lastName phone email'})
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
            res.json(order);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
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

// * Cities

exports.addCity = (req, res, next) => {
    Cities.create(req.body).then(city => {
        Cities.find({}).then(resp => {
            changeCities(resp);
            res.json(resp);
        })
    })
    .catch(err => next(err));
}

exports.updateCity = (req, res, next) => {
    Cities.findOneAndUpdate({_id: req.body._id}, {title: req.body.title, price: req.body.price}, {new: true}).then(city => {
        Cities.find({}).then(resp => {
            changeCities(resp);
            res.json(resp);
        })
    })
    .catch(err => next(err));
}

// * Governate

exports.addGovernate = (req, res, next) => {
    Governate.create(req.body).then(gov => {
        Governate.find({}).then(resp => {
            changeGovernates(resp);
            res.json(resp);
        })
    })
    .catch(err => next(err));
}

exports.updateGovernate = (req, res, next) => {
    Governate.findOneAndUpdate({_id: req.body._id}, {title: req.body.title, price: req.body.price}, {new: true}).then(city => {
        Governate.find({}).then(resp => {
            changeGovernates(resp);
            res.json(resp);
        })
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

// * Featured Stores

exports.getFeaturedStores = (req, res, next) => {
    FeaturedStore.find({})
    .populate('categories')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.addFeaturedStores = (req, res ,next) => {
    FeaturedStore.create(req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.removeFeaturedStores = (req, res, next) => {
    FeaturedStore.findOneAndDelete({_id: req.body.store})
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



// Finance Info 


exports.getPendingFunds = (req, res, next) => {

    StorePayment
    .find({fullfilled : false, created_at: {
                            $gte: new Date(new Date()- req.body.days * 24 * 60 * 60 * 1000),
                        } })
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"Pending funds": funds});
    })
}

exports.getPendingFundsFull = (req, res, next) => {

    StorePayment
    .find({fullfilled : false })
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"Pending funds": funds});
    })
}

exports.getPaidFunds = (req, res, next) => {

    StorePayment
    .find({fullfilled : true, created_at: {
                            $gte: new Date(new Date()- req.body.days * 24 * 60 * 60 * 1000),
                        } })
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"Paid funds": funds});
    })
}

exports.getPaidFundsFull = (req, res, next) => {

    StorePayment
    .find({fullfilled : true })
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"Paid funds": funds});
    })
}

exports.getFunds = (req, res, next) => {

    StorePayment
    .find({created_at: {
                            $gte: new Date(new Date()- req.body.days * 24 * 60 * 60 * 1000),
                        } })
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"total funds": funds});
    })
}

exports.getFundsFull = (req, res, next) => {

    StorePayment
    .find({})
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                funds += payment.amount ;
            });
        res.status(200).json({"total funds": funds});
    })
}


exports.getStoreFunds = (req, res, next) => {

    let credit =0;
    let withdrawed=0 ;
    let pending =0 ;
    StorePayment
    .find({store : req.params.id})
    .populate({path:'store', select :'credit'})
    .then(payments => {
        var funds =0 ;
        payments.forEach(payment => 
            {
                credit = payment.store.credit
                if(payment.fullfilled==false)
                    pending += payment.amount ;
                if(payment.fullfilled ==true)
                    withdrawed += payment.amount ;
            });
        if(withdrawed >= credit)
            withdrawed -= credit ;
        res.status(200).json({"Current credit": credit, "Withdrawed credit":withdrawed, "Pending credit":pending});
    })
}

exports.getWithdraws = (req, res, next) => {

    WithdrawRequest
    .find({fulfilled:false})
    .populate({path:'store', select :'_id credit performance reviews title logo created_at'})
    .populate({path:'seller', select :'_id title name phone email'})
    .then(requests => {
        const resp = [];
        requests.forEach(request => 
            {
                resp.push(request);
            });

        res.status(200).json(resp);
    })
}

exports.getStoreWithdraws = (req, res, next) => {

    WithdrawRequest
    .find({store : req.params.id})
    .populate({path:'seller', select :'_id title name phone email'})
    .then(requests => {
        const resp = [];
        requests.forEach(request => 
            {
                resp.push(request);
            });

        res.status(200).json(resp);
    })
}

exports.fulfillWithdrawal = (req, res, next) => {

    if(!req.body.imageURL)
    {
        res.status(400).json({message:"add transaction image"});
    }
    if(!req.body.amount)
    {
        res.status(400).json({message:"add transaction amount"});
    }
    WithdrawRequest
    .findOneAndUpdate({_id:req.body.withdrawalRequest},{fulfilled:true, imageURL: req.body.imageURL, amount : req.body.amount})
    .populate({path:'store',select:'credit'})
    .then(request => {
        if(request.store.credit <req.body.amount)
        {
            WithdrawRequest
            .findOneAndUpdate({_id:req.body.withdrawalRequest},{fulfilled:false, imageURL: "", amount : ""})
            .then(res.status(400).json({message:"transaction amount is larger than store's credit"}));
        }else {
            Store.findOneAndUpdate({_id :request.store},{$inc:{credit :-req.body.amount}})
            .then( store=>
                res.status(200).json({message:"funds withdrawed successfully!!!"})
            )
            .catch(err=> res.json(err))
        }

    })
}


const checkArrayNotAll = (array, number) => {
    return array.reduce((elem, next) => elem && (next !== number), true);
}