const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Store = require('./Store');

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
    email: {
        type: String,
        unique: true,
    },
    title: {
        type: String,
        default: 'Store Manager'
    },
    facebookId: String,
    password: String,
    phone: String,
    image: String,
    languagePref: {
        type: Number,
        default: 0
    }
});

sellerSchema.post('save', function(doc){
    mongoose.model('Store').findOneAndUpdate({_id: doc.store}, {$push: {sellers: doc._id}});
});


const sellerModel = mongoose.model('Seller', sellerSchema);

module.exports = sellerModel;
