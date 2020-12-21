const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Store Manager'
    },
    authorities: {
        type: [Number],
        default: [0]
    }
});


const sellerModel = mongoose.model('Seller', sellerSchema);

module.exports = sellerModel;
