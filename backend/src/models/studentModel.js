const mongoose = require('mongoose');
const { Schema } = mongoose;
const studentSchema = new Schema({
    code: { type: String, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },
    dateOfBirth: { type: Date },
    placeOfBirth: { type: String },
    avatar: { type: String },
    isDelete: { type: Boolean, default: false },

    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
});
module.exports = mongoose.model('Student', studentSchema);
