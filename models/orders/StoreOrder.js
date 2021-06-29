const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeOrderSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    /**
     *  PRODUCT STATUS
     * ?  0 - Awaiting Confirmation
     * *  1 - Confirmed
     * *  2 - Order Processed
     * *  3 - Ready to Ship
     * *  4 - Out for Delivery
     * *  5 - Order Delivered
     * ! -1 - Cancelled
     * ! -2 - Refunded
     */
    status: {
        type: Number,
        default: 0
    },
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
        }],
        discount: Number,
        dealOfTheDay: Number,
        image: String,
        text: String,
        amount: Number
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
    refund: Boolean
}, {timestamps: { createdAt: 'created_at'}});

const storeOrderModel = mongoose.model('StoreOrder', storeOrderSchema);
module.exports = storeOrderModel;