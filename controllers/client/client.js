const Client = require('../../models/client/Client');
const Cart = require('../../models/client/Cart');
const Wishlist = require('../../models/client/Wishlist');
const ProductReview = require('../../models/seller/product/ProductReview');
const StoreReview = require('../../models/seller/StoreReview');
const Order = require('../../models/orders/Order');
const CancelRequest = require('../../models/orders/CancelRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendMail = require('../../sendgrid').sendMail;

exports.clientRegisterEmail = (req, res, next) => {
    console.log(req.body);
    const password = req.body.password;
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if(err)
            return next({status: 500, message: 'Internal Server Error'})
        const otp = 'ABCDE';
        const client = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            otp
        };
        Client.create(client)
        .then(resp => resp.toJSON())
        .then(resp => {
            // sendMail({
            //     mail: client.email,
            //     subject: 'Please Verify Your Email',
            //     text: `Verify your email with the code ${otp}`,
            //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
            // })
            // .then(() => {
                delete resp['password'];
                delete resp['otp'];
                Client.populate(resp, 'wishlist cart')
                .then(resp => res.json(resp));
            // });
        })
        .catch(err =>next({status: 400, message: err}));
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
                            const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                            return res.json({client: client, token, type: 'client'});
                        })
                    });
                }
            })
            .then(client => {
                const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                return res.json({client, token, type: 'client'});
            })
            .catch(err => console.log(err))

        }})
    .then(client => {
        if(client){
            const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
            return res.json({client, token, type: 'client'})
        }
    })
}

exports.clientLoginEmail = (req, res, next) => {
    Client.findOne({email: req.body.email})
    .populate({
        path: 'wishlist',
        populate: {
            path: 'products',
            populate: 'store'
        }
    })
    .populate({
        path: 'cart',
        populate: 'products.product'
    })
    .then(resp => resp.toJSON())
    .then(client => {
        if(client)
            bcrypt.compare(req.body.password, client.password, (err, result) => {
                delete client.password;
                if(err)
                    return next({status: 500, message: 'Incorrect Email or Password'});
                if(result){
                    if(client.verified){
                        const token = jwt.sign({ client: client._id }, req.app.get('secret_key'), { expiresIn: '90d'});
                        console.log({client, token, type: 'client'})
                        return res.json({client, token, type: 'client'})
                    }
                    else {
                        const otp = 'ABCDE';
                        // sendMail({
                        //     mail: client.email,
                        //     subject: 'Please Verify Your Email',
                        //     text: `Verify your email with the code ${otp}`,
                        //     html: `<p>Verify your email with the code <strong>${otp}</strong></p>`
                        // })
                        // .then(() => {
                            Client.updateOne({_id: client._id}, {otp})
                            .then(() => {
                                delete client.otp;
                                return res.json({client})
                            })
                            .catch(err => console.log(err))
                        // });
                    }
                }
                else next({message: 'Incorrect Email or Password', status: 401});
            })
        else next({status: 404, message: 'Incorrect Email or Password'})
    })
    .catch(err => next({status: 400, message: 'Incorrect Email or Password'}))
}

exports.clientVerifyOtp = (req, res, next) => {
    console.log(req.body);
    Client.findOne({email: req.body.email})
    .then(resp => resp.toJSON())
    .then(client => {
        if(req.body.otp.toUpperCase() === client.otp.toUpperCase()){
            Client.updateOne({email: client.email}, {verified: true}, {$unset: {otp: 1}})
            .then(client => {
                delete client.password;
                const token = jwt.sign({ client }, req.app.get('secret_key'), { expiresIn: '90d'});
                return res.json({client, token});
            })
        }
        else {
            return next({status: 400, message: 'Incorrect PIN'})
        }
    })
}

exports.clientUpdateInfo = (req, res, next) => {
    console.log('req.body is', req.body)
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
    .populate('products.product')
    .then(cart => {
        let subtotal = 0;
        cart.products.map(cartProd => {
            const product = cartProd.product;
            let price = product.price;
            product.options.map(option => {
                const pickedOption = cartProd.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                price += pick.extraPrice || 0;
            })
            subtotal += (price * cartProd.quantity);
        })
        res.json({subtotal});
    })
    .catch(err => next(err));
}

/*
 ? GET PURCHASE TOTAL
 */
exports.clientTotal = (req, res, next) => {
    const client = req.body.client;
    Cart.findOne({client})
    .populate('products.product')
    .then(cart => {
        let subtotal = 0;
        cart.products.map(cartProd => {
            const product = cartProd.product;
            let price = product.price;
            product.options.map(option => {
                const pickedOption = cartProd.options.filter(cartOption => cartOption.option.toString() === option._id.toString())[0];
                const pick = option.options.filter(optionOption => optionOption._id.toString() === pickedOption.pick._id.toString())[0];
                price += pick.extraPrice || 0;
            })
            subtotal += (price * cartProd.quantity);
        })
        const shipping = 80;
        const total = subtotal + shipping;
        res.json({subtotal, shipping, total});
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
    .populate('products.product')
    .then(resp => resp.toJSON())
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

    Cart.findOne({client})
    .populate('products.product')
    .then(_cart => {
        console.log(client, product, _cart)
        if(_cart.products.filter(prod => prod.product._id === product).length){
            console.log('we found it fam', _cart.products.map(prod => prod.product._id === product).length)
            return res.json(_cart);
        }
        else 
            Cart.findOneAndUpdate({client}, {$push: {products: {product, options, quantity}}}, {new: true})
            .populate('products.product')
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
    .populate('products.product')
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
    // const options = req.body.product.options.map(option => option._id);
    const product = req.body.product;

    Cart.findOne({client: client})
    .populate('products.product')
    .then(_cart => {
        if(!_cart.products.filter(prod => prod.product._id.toString() === product).length){
            return res.json(_cart);
        }
        else {
            Cart.findOneAndUpdate({client}, {$pull: {products: {product}}}, {new: true})
            .populate('products.product')
            .then(cart => res.json(cart))
            .catch(err => next(err))
        }
    })
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
    .populate('products')
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
    .populate('products')
    .then(_wishlist => {
        if(_wishlist.products.filter(prod => {
            return prod._id.toString() === product
        }).length){
            return res.json(_wishlist);
        }
        else {
            Wishlist.findOneAndUpdate({client}, {$push: {
                products: product}}, {new: true})
            .populate('products')
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
    .populate('orders.product cancelRequest')
    .then(resp => res.json(resp))
    .catch(err => next(err));
}
/*
?   PLACE ORDER
*/
exports.placeOrder = (req, res, next) => {
    const client = req.body.client;
    Cart.findOne({client})
    .populate({
        path: 'products.product',
        select: 'options price store'
    })
    .populate({
        path: 'client',
        select: 'addresses'
    })
    .then(cart => {
        const address = cart.client.addresses.filter(address => address.active)[0];
        const order = {
            orders: cart.products,
            client,
            address,
            code: createId(7)
        };
        Order.create(order)
        .then(resp => resp.toJSON())
        .then(resp => {
            Cart.findOneAndUpdate({client}, {products: []}, {new: true})
            .then(cart => res.json({order: resp, cart}))
        })
        .catch(err => next(err));
    })
}
/*
?   CANCEL ORDER
*/
exports.cancelOrder = (req, res, next) => {
    const client = req.body.client;
    const order = req.body.order;
    const stores = order.orders.map(order => order.product.store);
    console.log({
        client: order.client,
        order: order._id,
        stores
    })
    CancelRequest.create({
        client: order.client,
        order: order._id,
        stores
    })
    .then(resp => resp.toJSON())
    .then(cancel => {
        Order.findOneAndUpdate({client, _id: order._id}, {cancelRequest: cancel._id}, {new: true})
        .populate('cancelRequest')
        .then(resp => res.json(resp))
        .catch(err => next(err))
    })
    .catch(err => next(err));
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

    ProductReview.create(review)
    .then(resp => resp.toJSON())
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

    StoreReview.create(review)
    .then(resp => resp.toJSON())
    .then(storeReview => res.json(storeReview))
    .catch(err => next(err));
}

exports.productReviewHelpful = (req, res, next) => {
    
}

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCTION                              */
/* -------------------------------------------------------------------------- */

const createId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }