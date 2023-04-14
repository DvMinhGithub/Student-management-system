const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
    role: { type: String, default: 'student', enum: ['student', 'admin'] },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
});
module.exports = mongoose.model('Account', accountSchema);
