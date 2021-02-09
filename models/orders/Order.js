const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StoreOrder = require('./StoreOrder');

const orderSchema = new Schema({
    orders: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        options: [{
            // ? Option is the ID of the outer option object (e.g Color, Size, etc..)
           option: Schema.Types.ObjectId,
           
           // ? Pick is the ID of the inner object, aka which suboption was picked from the options (e.g Small, Large, XXL)
           pick: Schema.Types.ObjectId
        }]
    }],
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    code: String,
    address: {
        governate: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: true
        },
        extra: String,
    },
    deliveryTime: Date,
    cancelRequest: {
        type: Schema.Types.ObjectId,
        ref: 'CancelRequest'
    },
    storeOrders: {
        type: Schema.Types.ObjectId,
        ref: 'StoreOrder'
    },
    refund: Boolean
}, {timestamps: { createdAt: 'created_at'}});

orderSchema.post('save', function(doc, next) {
    console.log('saving new doc', doc);
    doc.populate('orders.product').execPopulate().then(() => {
        let stores = doc.orders.map(order => ({store: order.product.store, status: 0, order: order._id}));
        console.log('stores list', stores)
        let arr = [];
        stores.forEach(store => {
            let exists = arr.filter(yStore => yStore.store.toString() === store.store.toString()).length;
            if(!exists){
                arr.push(store);
            }
        })
        stores = arr;
        console.log('revised store list', stores);
        StoreOrder.insertMany(stores)
        .then(res => {
            console.log('Successfully added store orders!', res);
            doc.stores = res.filter(order => order._id)
            doc.save();
            next()
        })
        .catch(err => next(err));
    })
})

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
