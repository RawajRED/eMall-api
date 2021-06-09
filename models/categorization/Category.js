const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        }
    },
    description: {
        en: {
            type: String
        },
        ar: {
            type: String
        }
    },
    banner: String,
    image: {
        type: String,
        default : 'https://emall-bucket.s3.us-east-2.amazonaws.com/19044368211578983122-128.png'
    }
});

const categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;