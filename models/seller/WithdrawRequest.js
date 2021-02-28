
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawRequestSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'Seller'
    },
    amount: Number,
    fulfilled: {
        type: Boolean,
        default: false
    }
}, {timestamps: { createdAt: 'created_at'}});

const withdrawRequestModel = mongoose.model('WithdrawRequest', withdrawRequestSchema);

module.exports = withdrawRequestModel;    