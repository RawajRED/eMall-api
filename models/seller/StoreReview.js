const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Store = require('./Store');

const storeReviewSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    } ,
    stars: Number,
    review: String,
    helpful: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
    notHelpful: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
    reports: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
})

storeReviewSchema.pre('save', function(next){
    console.log('this is',this);
    storeReviewModel.findOne({store: this.store, client: this.client})
    .then(resp => {
        console.log('RESP FOUND!!!!!!!!!!!!!', resp)
        if(resp)
            return next({status: 403, message: 'You already left a review for this store!'})
        else next();
    })
})

storeReviewSchema.post('save', doc => {
    Store.updateOne({_id: doc.store}, {$push: {reviews: doc._id}})
    .then(resp => {
        console.log('success!', resp);
    })
    .catch(err => console.log('ERR!!!!', err));
})

const storeReviewModel = mongoose.model('StoreReview', storeReviewSchema);

module.exports = storeReviewModel;    