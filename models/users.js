const mongoose = require('mongoose')



const UserScheme = new mongoose.Schema(

    {
        name: String,
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
            default: 0
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