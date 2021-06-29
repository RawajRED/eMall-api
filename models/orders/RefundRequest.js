const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refundSchema = new Schema({
    storeOrders: [{
        storeOrder: {
            type: Schema.Types.ObjectId,
            ref: 'StoreOrder',
            required: true
        },
        orders: [Schema.Types.ObjectId]
    }],
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    code: String,
    /* Status:
        * 0 - requested
        ?  1 - accepted
        ?  2 - confirmed
        ! -1 - rejected
    */
    status: {
        type: Number,
        default: 0
    },
}, {timestamps: { createdAt: 'created_at'}});


const refundModel = mongoose.model('RefundRequest', refundSchema);

module.exports = refundModel;