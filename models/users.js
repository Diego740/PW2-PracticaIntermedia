const mongoose = require('mongoose')



const UserScheme = new mongoose.Schema(

    {
        name: String,
        surnames: String,
        nif: String,
        email: {
            type: String,
            unique: true
        },
        password: String,
        role: {
            type: ['user', 'admin'],
            default: 'user'
        },
        attemps:{
            type: Number,
            default: 3
        },
        code: Number,
        verificated: {
            type: Boolean,
            default: false
        }


    },
    {
        timestamps: true,
        versionKey: false
    }

)

module.exports = mongoose.model('users', UserScheme)