const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeViewSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    } 
}, {timestamps: { createdAt: 'created_at'}})


const storeViewModel = mongoose.model('StoreView', storeViewSchema);

module.exports = storeViewModel;    