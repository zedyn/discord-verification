const { model, Schema } = require('mongoose');

module.exports = model(
    'codes',
    new Schema({
        _id: String,
        code: Number,
    })
);
