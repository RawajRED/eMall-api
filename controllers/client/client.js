const Client = require('../../models/client/Client');
const Cart = require('../../models/client/Cart');
const ClientPayment = require('../../models/client/ClientPayment');
const Wishlist = require('../../models/client/Wishlist');
const ProductReview = require('../../models/seller/product/ProductReview');
const StoreReview = require('../../models/seller/StoreReview');
const Order = require('../../models/orders/Order');
const StoreOrder = require('../../models/orders/StoreOrder');
const RefundRequest = require('../../models/orders/RefundRequest');
const DealOfTheDay = require('../../models/other/DealOfTheDay');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendMail = require('../../sendgrid').sendMail;
const { sendMessage } = require('../../twilio');
const { getVariables } = require('../../variables');

// TODO: Login with email
exports.clientRegisterPhone = (req, res, next) => {
    const password = req.body.password;
    const saltRounds = 10;
    const otp = generateOtp(5);
    // TODO: Revert this
    const phone = normalizePhone(req.body.phone);
    bcrypt.hash(password, saltRounds, (errPass, hashPass) => {
        // bcrypt.hash(otp, saltRounds, (errOTP, hashOTP) => {
            
            if(errPass)
                return next({status: 500, message: 'Internal Server Error'})
            const client = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hashPass,
                phone,
                otp
            };
            Client.create(client)
            .then(resp => {
                return resp.toJSON();
            })
            .then(resp => {
                
                // sendMail({
                //     mail: client.email,
                //     subject: 'Please Verify Your Email',
                //     text: `Verify your email with the code ${otp}`,
                //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
                // })
                sendMessage(`Your verification code is ${otp}`, phone)
                .then(() => {
                    delete resp['password'];
                    delete resp['otp'];
                    Client.populate(resp, 'wishlist cart')
                    .then(resp => res.json(resp));
                });
            })
            .catch(err =>next({status: 400, message: err}));
        // })
    })
};

exports.clientLoginFacebook = (req, res, next) => {
    // *Check if there's a client registered with this Facebook ID
    Client.findOne({facebookId: req.body.id})
    .populate('cart wishlist')
    .then(resp => {
        if(resp)
            return resp.toJSON()
        else {
            // *Check if client is registered with email and link
            Client.findOneAndUpdate({email: req.body.email}, {facebookId: req.body.id, verified: true}, { new: true })
            .populate('cart wishlist')
            .then(resp => {
                if(resp)
                    return resp.toJSON();
                else {
                    let name = req.body.name.split(" ");
                    name = name.length > 1 ? {firstName: name[0], lastName: name[1]} : {firstName: name[0], lastName: ''}
                    Client.create({
                        email: req.body.email,
                        facebookId: req.body.id,
                        image: req.body.picture.data.url,
                        verified: true,
                        ...name
                    })
                    .then(resp => resp.toJSON())
                    .then(_client => {
                        Client.populate(_client, 'wishlist cart')
                        .then(client => {
                            const accessToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                            const refreshToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '3650d'});
                            return res.json({client: client, accessToken, refreshToken, type: 'client'});
                        })
                    });
                }
            })
            .then(client => {
                const accessToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                const refreshToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '3650d'});
                return res.json({client, accessToken, refreshToken, type: 'client'});
            })
            .catch(err => console.log(err))

        }})
    .then(client => {
        if(client){
            const accessToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
            const refreshToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '3650d'});
            return res.json({client, accessToken, refreshToken, type: 'client'});
        }
    })
}

exports.clientLoginPhone = (req, res, next) => {
    const phone = normalizePhone(req.body.phone);
    Client.findOne({phone})
    .populate({
        path: 'wishlist',
        populate: {
            path: 'products',
            populate: 'store'
        }
    })
    .populate('cart')
    .then(resp => resp.toJSON())
    .then(client => {
        if(client)
            bcrypt.compare(req.body.password, client.password, (err, result) => {
                delete client.password;
                if(err)
                    return next({status: 500, errors: [{en: 'Incorrect Phone Number or Password', ar: 'رقم الهاتف أو كلمة مرورغير صحيحة'}]});
                if(result){
                    if(client.verified){
                        const accessToken = jwt.sign({ client: client._id }, req.app.get('secret_key'), { expiresIn: '90d'});
                        const refreshToken = jwt.sign({ client: client._id }, req.app.get('secret_key'), { expiresIn: '365d'});
                        return res.json({client, accessToken, refreshToken, type: 'client'})
                    }
                    else {
                        const otp = client.otp;
                        // sendMail({
                        //     mail: client.email,
                        //     subject: 'Please Verify Your Email',
                        //     text: `Verify your email with the code ${otp}`,
                        //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
                        // })
                        sendMessage(`Your verification code is ${otp}`, phone)
                        .then(() => {
                            Client.updateOne({_id: client._id}, {otp})
                            .then(() => {
                                delete client.otp;
                                return res.json({client})
                            })
                            .catch(err => console.log(err))
                        });
                    }
                }
                else next({status: 403, errors: [{en: 'Incorrect Phone Number or Password', ar: 'رقم الهاتف أو كلمة مرورغير صحيحة'}]});
            })
        else next({status: 403, errors: [{en: 'Incorrect Phone Number or Password', ar: 'رقم الهاتف أو كلمة مرورغير صحيحة'}]})
    })
    .catch(err => next({status: 403, errors: [{en: 'Incorrect Phone Number or Password', ar: 'رقم الهاتف أو كلمة مرورغير صحيحة'}]}))
}

exports.clientLoginToken = (req, res, next) => {
    Client.findOne({_id: req.body.client})
    .populate({
        path: 'wishlist',
        populate: {
            path: 'products',
            populate: 'store'
        }
    })
    .populate('cart')
    .then(client => {
        return res.json({client, type: 'client'})
    })
    .catch(err => next(err));
}

exports.clientRefreshToken = (req, res, next) => {
    Client.findOne({_id: req.body.client})
    .populate({
        path: 'wishlist',
        populate: {
            path: 'products',
            populate: 'store'
        }
    })
    .populate('cart')
    .then(client => {
        const accessToken = jwt.sign({ client: client._id }, req.app.get('secret_key'), { expiresIn: '90d'});
        return res.json({client, type: 'client', token: accessToken});
    })
    .catch(err => next(err));
}

exports.clientVerifyOtp = async (req, res, next) => {
    const phone = normalizePhone(req.body.phone);
    // const client = await Client.findOne({phone});
    // if(!client)
    //     return next({status: 403, message: 'Incorrect PIN or Password'})
    // bcrypt.compare(req.body.otp, client.otp, (err, resp) => {
    //     if(err)
    //         return next({status: 403, message: 'Incorrect PIN or Password'})
    //     client
    //     .populate({
    //         path: 'wishlist',
    //         populate: {
    //             path: 'products',
    //             populate: 'store'
    //         }
    //     })
    //     .populate('cart');
    //     client.otp = null;
    //     client.verified = true;
    //     client.save();
    //     delete client.password;
    //     const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
    //     return res.json({client, token, type: 'client'});
    // })
    Client.findOneAndUpdate({phone, otp: req.body.otp.toUpperCase()}, {verified: true, $unset: {otp: 1}}, {new: true})
    .populate({
        path: 'wishlist',
        populate: {
            path: 'products',
            populate: 'store'
        }
    })
    .populate('cart')
    .then(client => {
        if(!client){
            return next({status: 400, message: 'Incorrect PIN'})
        } else {
            delete client.password;
            const accessToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
            const refreshToken = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '365d'});
            return res.json({client, accessToken, refreshToken, type: 'client'});
        }
    })
    .catch(err => next({status: 400, message: 'Incorrect PIN'}))
}

exports.clientForgotPassword = (req, res, next) => {
    const otp = generateOtp(4);
    const phone = normalizePhone(req.body.phone);
    Client.findOneAndUpdate({phone}, {resetOtp: otp}, {new: true})
    .then(client => {
        // sendMail({
        //     mail: client.email,
        //     subject: 'Forget Password',
        //     text: `Change your password using this code : ${otp}`,
        //     html: `<p> Change your password using this code <strong>${otp}</strong></p>`
        // })
        sendMessage(`Your password reset code is ${otp}`, phone)
        .then(() => {
            res.json({confirm: true})
    });
        
    })
    .catch(err => next(err));
}

exports.clientChangePassword = (req, res, next) => {
    const phone = normalizePhone(req.body.phone);
    Client.findOne({phone, resetOtp: req.body.otp})
    .then(client => {
        if(!client) return res.json({confirmed: false})
        const password = req.body.password;
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if(err) throw new Error(err);
            Client.findOneAndUpdate({_id: client._id}, {password: hash, $unset: {resetOtp: null}})
            .then(() => {
                res.json({confirmed: true});
            })
        });
    })
    .catch(err => next(err));
}

exports.clientChangePasswordDirect = (req, res, next) => {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    Client.findOne({_id: req.body.client})
    .then(client => {
        bcrypt.compare(password, client.password, (err, result) => {
            if(err) return next({status: 403, message: {en: 'Incorrrect Current Password', ar: 'كلمة المرور الحالية غير صحيحة'}});
            if(!result) return next({status: 403, message: {en: 'Incorrrect Current Password', ar: 'كلمة المرور الحالية غير صحيحة'}});
            const saltRounds = 10;
            bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                if(err) throw new Error(err);
                Client.findOneAndUpdate({_id: client._id}, {password: hash})
                .then(() => {
                    res.sendStatus(200);
                })
                .catch(err);
            });
        });
    })
    .catch(err => next(err));

}

exports.clientCheckOtp = (req, res, next) => {
    Client.findOne({email: req.body.email})
    .then(client => {
        if(client.resetOtp === req.body.otp.toUpperCase())
            return res.json({confirmed: true})
        return res.json({confirmed: false})
    })
    .catch(err => next(err));
}

exports.sendOtpToNewPhone = async (req, res, next) => {
    const phone = normalizePhone(req.body.phone);
    const otp = generateOtp(5);
    sendMessage(phone, `Your pin is ${otp}`)
    .then(() => {
        Client.findOneAndUpdate({_id: req.body.client}, {otp, newPhone: phone}, {new: true})
        .then(() => res.sendStatus(200))
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

exports.verifyNewPhone = (req, res, next) => {
    Client.findOne({_id: req.body.client})
    .then(client => {
        if(client.otp === req.body.otp){
            Client.findOneAndUpdate({_id: req.body.client}, {phone: client.newPhone, $unset: {otp: 1, newPhone: 1}}, {new: true})
            .then(() => res.sendStatus(200))
            .catch(err => next(err));
        }
        else return res.sendStatus(403);
    })
    .catch(err => next(err));
}

exports.clientUpdateInfo = (req, res, next) => {
    Client.findOneAndUpdate({_id: req.body.client}, req.body, {new: true})
    .then(resp => {resp ? res.json(resp) : next({status: 404, message: `Couldn't find client`})})
    .catch(err => next({status: 400, message: err}))
}

exports.clientDeleteAccount = (req, res, next) => {
    Client.findOneAndDelete({_id: req.body.client})
    .then(() => res.json({status: 200, message: 'Successfully deleted account'}))
    .catch(err => next(err))
}

/*
 ? GET PURCHASE SUBTOTAL
 */
exports.clientSubtotal = (req, res, next) => {
    const client = req.body.client;
    Cart.findOne({client})
    .populate({path :'products.product',match :{isDeleted:false}})
    .then(cart => {
        let subtotal = 0;
        const productIDs = cart.products.map(prod => prod.product._id);

        // ! Find if "Deal Of The Day" exists
        DealOfTheDay.find({product: {$in: productIDs}})
        .then(deals => {
            cart.products.map(cartProd => {
                const product = cartProd.product;
                const deal = deals.filter(deal => deal.product.toString() === cartProd.product._id.toString())[0];
                let price = product.price;
                product.options.map(option => {
                    const pickedOption = cartProd.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                    const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                    price += pick.extraPrice || 0;
                })
                subtotal += (price * cartProd.quantity) * (deal ? (1-(deal.discount/100)) : 1) * (product.discount ? 1 - product.discount : 1);
            })
            res.json({subtotal});
        })
    })
    .catch(err => next(err));
}

/*
 ? GET PURCHASE TOTAL
 */
exports.clientTotal = (req, res, next) => {
    const client = req.body.client;
    Cart.findOne({client})
    .populate({path :'products.product',match :{isDeleted:false}})
    .then(cart => {
        let subtotal = 0;
        const productIDs = cart.products.map(prod => prod.product._id);

        // ! Find if "Deal Of The Day" exists
        DealOfTheDay.find({product: {$in: productIDs}})
        .then(deals => {
            cart.products.map(cartProd => {
                const product = cartProd.product;
                const deal = deals.filter(deal => deal.product.toString() === cartProd.product._id.toString())[0];
                let price = product.price;
                product.options.map(option => {
                    const pickedOption = cartProd.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                    const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                    price += pick.extraPrice || 0;
                });
                subtotal += (price * cartProd.quantity) * (deal ? 1-(deal.discount/100) : 1) * (product.discount ? 1 - product.discount : 1);
            })
            const shipping = getVariables().shipping;
            const total = subtotal + shipping;
            res.json({subtotal, shipping, total});
        })
    })
    .catch(err => next(err));
}


/* -------------------------------------------------------------------------- */
/*                                    CART                                    */
/* -------------------------------------------------------------------------- */


/* 
?   GET CART
*/
exports.getClientCart = (req, res, next) => {
    const client = req.body.client;
    Cart.findOne({client})
    .populate({
        path: 'products.product',
        populate: 'dealOfTheDay store'
    })
    .then(resp => res.json(resp))
    .catch(err => next({status: 404, message: "Couldn't find cart"}))
}


/* 
?   ADD TO CART
!   Requires Token
*   body: {
*       product: id,
*       options: [id, id, id],
*       quantity: 3
*   }
*/
exports.addToCart = (req, res, next) => {
    const client = req.body.client;
    const product = req.body.product;
    const quantity = req.body.quantity;
    const options = req.body.options;
    const text = req.body.text;
    const image = req.body.image;
    const code = generateAlphaNumericOtp(7);

    Cart.findOne({client})
    .then(_cart => {
        if(_cart.products.filter(prod => prod.product._id === product).length){
            return res.json(_cart);
        }
        else 
            Cart.findOneAndUpdate({client}, {$push: {products: {product, options, quantity, text, image, code}}}, {new: true})
            .then(cart => res.json(cart))
            .catch(err => next(err))
    })
    
    //// Cart.findOneAndUpdate({client: client}, req.body.updates, {new: true})
    //// .then(resp => resp.toJSON())
    //// .then(resp => res.json(resp))
    //// .catch(err => next(err))
}

/* 
?   UPDATE CART
!   Requires Token
*   body: {
*       updates: {
*           quantity: 2,
*           options: [id, id, id]    
*       }
*   }
*/
exports.updateCart = (req, res, next) => {
    const client = req.body.client;
    // const options = req.body.product.options.map(option => option._id);
    const product = req.body.product;
    const options = req.body.options;
    const quantity = req.body.quantity;
    Cart.findOneAndUpdate({client, 'products.product': product}, {$set: {
        'products.$.product': product,
        'products.$.quantity': quantity,
        'products.$.options': options}
    }, {new: true})
    .then((cart) => res.json(cart))
    .catch(err => next(err))
}

/* 
?   REMOVE FROM CART
!   Requires Token
*   body: {
*       product: id
*   }
*/
exports.removeFromCart = (req, res, next) => {
    const client = req.body.client;
    const code = req.params.code;
    Cart.findOne({client})
    .then(async cart => {
        cart.products = cart.products.filter(product => product.code !== code);
        await cart.save();
        res.json(cart);
    })
    // Cart.findOneAndUpdate({client}, {$pull: {'products.code': product.code}}, {new: true})
    // .then(cart => res.json(cart))
    // .catch(err => next(err))
}

/* -------------------------------------------------------------------------- */
/*                                 WISHLIST                                */
/* -------------------------------------------------------------------------- */

/* 
?   GET WISHLIST
*/
exports.getClientWishlist = (req, res, next) => {
    const client = req.body.client;
    Wishlist.findOne({client})
    .populate({path :'products',match :{isDeleted:false}})
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next({status: 404, message: "Couldn't find wishlist"}))
}


/* 
?   ADD TO WISHLIST
!   Requires Token
*   body: {
*       product: id
*   }
*/
exports.addToWishlist = (req, res, next) => {
    const client = req.body.client;
    const product = req.body.product;

    Wishlist.findOne({client})
    .populate({path :'products',match :{isDeleted:false}})
    .then(_wishlist => {
        if(_wishlist.products.filter(prod => {
            return prod._id.toString() === product
        }).length){
            return res.json(_wishlist);
        }
        else {
            Wishlist.findOneAndUpdate({client}, {$push: {
                products: product}}, {new: true})
            .populate({path :'products',match :{isDeleted:false}})
            .then((wishlist) => res.json(wishlist))
            .catch(err => next(err))
        }
    })
}

/* 
?   REMOVE FROM WISHLIST
!   Requires Token
*   body: {
*       product: id
*   }
*/
exports.removeFromWishlist = (req, res, next) => {
    const client = req.body.client;
    const product = req.body.product;
    Wishlist.findOneAndUpdate({client}, {$pull: {
        products: product}}, {new: true})
    .populate('products')
    .then((wishlist) => res.json(wishlist))
    .catch(err => next(err))
}

/* -------------------------------------------------------------------------- */
/*                                   ORDERS                                   */
/* -------------------------------------------------------------------------- */

function filterUnique(value, index, self) {
    return self.indexOf(value) === index;
}

/*
? GET OWN ORDERS
*/
exports.getOrders = (req, res, next) => {
    const client = req.body.client;
    Order.find({client})
    .populate({
        path: 'storeOrders',
        populate: 'orders.product'
    })
    .sort({'created_at': -1})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}
/*
?   PLACE ORDER
*/
exports.placeOrder = (req, res, next) => {
    const client = req.body.client;
    const code = generateAlphaNumericOtp(7);

    // ! Get Cart Content
    Cart.findOne({client})
    .populate({
        path: 'products.product',
        select: 'options price store discount',
        match : {isDeleted : false }
    })
    .populate({
        path: 'client',
        select: 'addresses'
    })
    .then(cart => {
        const address = cart.client.addresses.filter(address => address.active)[0];
        
        // ! Create Orders and Get Deals
        const prods = cart.products.map(product => product.product._id);

        // ! Find Deals
        DealOfTheDay.find({product: {$in: prods}})
        .then(deals => {
            let obj = {};
            cart.products.forEach(product => {
                const discount =  deals.filter(deal => deal.product.toString() === product.product._id.toString())[0];
                if(obj.hasOwnProperty(product.product.store)){
                    obj[product.product.store].push({...product._doc, discount: product.product.discount, dealOfTheDay: discount ? discount.discount : null});
                }
                else obj[product.product.store] = [{...product._doc, image: product.image, amount: product.price, text: product.text, discount: product.product.discount, dealOfTheDay: discount ? discount.discount : null}];
            });
            let arr = [];
            for (let store in obj) {
                let orders = obj[store];
                arr.push({store, orders, code, client, address});
            }

            // ! Get Total
            let subtotal = 0;
            cart.products.map(cartProd => {
                const product = cartProd.product;
                const deal = deals.filter(deal => deal.product.toString() === cartProd.product._id.toString())[0];
                let price = product.price;
                product.options.map(option => {
                    const pickedOption = cartProd.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                    const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                    price += pick.extraPrice || 0;
                })
                subtotal += (price * cartProd.quantity) * (deal ? (1-(deal.discount/100)) : 1) * (product.discount ? 1 - product.discount : 1);
            })
            let total = subtotal + getVariables().shipping;
            StoreOrder.insertMany(arr)
            .then(resp => {
                const storeOrders = resp.map(storeOrder => storeOrder._id);
                cart.products = [];
                cart.save();
                Order.create({
                    storeOrders,
                    code,
                    address,
                    client,
                    total
                })
                .then(resp => resp.toJSON())
                .then(resp => res.json(resp))
                .catch(err => next(err));
            })
            .catch(err => next(err));
        })
    })
}
/*
?   CANCEL ORDER
*/
exports.cancelOrder = (req, res, next) => {
    const client = req.body.client;
    const order = req.body.order;
    Order.findOneAndUpdate({client, _id: order._id}, {status: -1}, {new: true})
    .then(resp => {
        StoreOrder.findOneAndUpdate({code: resp.code}, {status: -1}, {new: true})
        .then(resp => {
            res.json(resp)
        })
    })
    .catch(err => next(err))
}

/*
?   Get Products in Order
*/
exports.getOrderProducts = (req, res, next) => {
    const code = req.params.code;
    StoreOrder.find({code, client: req.body.client})
    .populate('orders.product')
    .then(resp => {
        // const products = resp.map(order => order.orders);
        res.json([].concat.apply([], resp))
    });
}


/* -------------------------------------------------------------------------- */
/*                                   REVIEWS                                  */
/* -------------------------------------------------------------------------- */

exports.leaveProductReview = (req, res, next) => {
    const review = {
        product: req.body.product,
        client: req.body.client,
        stars: req.body.stars,
        review: req.body.review
    };

    ProductReview.findOneAndUpdate({client: req.body.client, product: req.body.product}, review, {upsert: true, new: true})
    .then(productReview => res.json(productReview))
    .catch(err => next(err));
}

exports.leaveStoreReview = (req, res, next) => {
    const review = {
        store: req.body.store,
        client: req.body.client,
        stars: req.body.stars,
        review: req.body.review
    }

    StoreReview.findOneAndUpdate({client: req.body.client, store: req.body.store}, review, {upsert: true, new: true})
    .then(storeReview => res.json(storeReview))
    .catch(err => next(err));
}

exports.productReviewHelpful = (req, res, next) => {
    
}

/* -------------------------------------------------------------------------- */
/*                                   PROFILE                                  */
/* -------------------------------------------------------------------------- */
exports.getProfile = (req, res, next) => {
    const client = req.body.client;
    Client.findOne({_id: client})
    .select('email firstName lastName phone')
    .then(resp => {
        res.json(resp)
    })
    .catch(err => next(err))
}

exports.updateProfile = (req, res, next) => {
    const client = req.body.client;
    Client.findOneAndUpdate({_id: client}, req.body, {new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                                  PAYMENTS                                  */
/* -------------------------------------------------------------------------- */
exports.getPayments = (req, res, next) => {
    ClientPayment.find({client: req.body.client})
    .populate('order')
    .then(resp => {
        res.json(resp);
    })
    .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                                   REFUND                                   */
/* -------------------------------------------------------------------------- */

exports.requestRefund = (req, res, next) => {
    RefundRequest.findOneAndUpdate({client: req.body.client}, {
        status: 0,
        storeOrders: req.body.storeOrders,
        code: req.body.code,
        client: req.body.client,
        order: req.body.order
    }, {upsert: true, new: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCTION                              */
/* -------------------------------------------------------------------------- */


const generateOtp = (number = 5) => Array.from(Array(number).keys()).map(() => Math.floor(Math.random()*10)).join("");
// const generateOtp = (number = 5) => '1234567890'.substr(0, number);

const generateAlphaNumericOtp = (number = 5) => Array.from(Array(number).keys()).map(() => Math.floor(Math.random()*10)).join("");

const normalizePhone = (phone) => {
    if(phone.match(/^\+20[0-9]{10}$/))
        return phone;
    else if(phone.match(/^0[0-9]{10}$/))
        return `+2${phone}`;
    else return '';
}