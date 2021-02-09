const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cancelSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    stores: [{
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }],
    status: {
        type: Number,
        default: 0
    }
});

const cancelModel = mongoose.model('CancelRequest', cancelSchema);

module.exports = cancelModel;