const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    storeOrders: [{
        type: Schema.Types.ObjectId,
        ref: 'StoreOrder'
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
    status: {
        type: Number,
        default: 0
    },
    cancel: Boolean,
    refund: Boolean
}, {timestamps: { createdAt: 'created_at'}});


const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
