const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./Product');

const productReviewSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
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

productReviewSchema.pre('save', function(next){
    productReviewModel.findOne({product: this.product, client: this.client})
    .then(resp => {
        if(resp)
            return next({status: 403, message: 'You already left a review for this product!'})
        else next();
    })
})

productReviewSchema.post('save', doc => {
    Product.updateOne({_id: doc.product}, {$push: {reviews: doc._id}})
    .catch(err => console.log('Error when creating a product review', err));
})

const productReviewModel = mongoose.model('ProductReview', productReviewSchema);

module.exports = productReviewModel;    