const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username :{
        type :String,
        required : true,
        unique : true  
    },
    mainAdmin :{
        type : Boolean,
        required :true,
        default :false
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