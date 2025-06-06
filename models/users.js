const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete');


const UserScheme = new mongoose.Schema(

    {
        name: String,
        surnames: String,
        nif: String,
        logo: String,
        email: {
            type: String,
            unique: true
        },
        password: String,
        role: {
            type: ['user', 'admin', 'guest'],
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
        },
        company: {
            name: String,
            cif: String,
            street: String,
            number: Number,
            postal: Number,
            city: String,
            province: String,
        }


    },
    {
        timestamps: true,
        versionKey: false
    }

)
UserScheme.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('User', UserScheme)