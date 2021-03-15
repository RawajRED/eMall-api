const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storePaymentSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    storeOrder: {
        type: Schema.Types.ObjectId,
        ref: 'StoreOrder'
    },
    amount: Number,
    added: {
        type: Boolean,
        default: false
    },
    addedOn: Date
}, {timestamps: { createdAt: 'created_at'}});

const storePaymentModel = mongoose.model('StorePayment', storePaymentSchema);

module.exports = storePaymentModel;