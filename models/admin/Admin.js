const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    email :{
        type :String,
        required : true
    },
    password: {
        type: String,
        required: true
    },
    deleted: {
        type : Boolean,
        default : false
    }
});

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = adminModel;