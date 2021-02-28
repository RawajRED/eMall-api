const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dealOfTheDaySchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    discount: Number,
    active: {
        type: Boolean,
        default: false
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    clicks: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }]
}, {timestamps: { createdAt: 'created_at'}});

const dealOfTheDayModel = mongoose.model('DealOfTheDay', dealOfTheDaySchema);

module.exports = dealOfTheDayModel;