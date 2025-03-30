const mongoose = require('mongoose')

const storageSchema = new mongoose.Schema(

    {
        filename: String,
        url: String
    },
    {
        timestamps: true,
        versionKey: false
    }

)

module.exports = mongoose.model('storage', storageSchema)