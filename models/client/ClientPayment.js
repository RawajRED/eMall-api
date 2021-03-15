const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientPaymentSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    total: Number,
    // * 0 - Cash
    // * 1 - Card
    type: Number
}, {timestamps: { createdAt: 'created_at'}});

const clientPaymentModel = mongoose.model('ClientPayment', clientPaymentSchema);

module.exports = clientPaymentModel;