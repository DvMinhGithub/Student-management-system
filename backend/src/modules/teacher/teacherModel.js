const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
    code: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },
    dob: { type: Date },
    avatar: { type: String },
    isDelete: { type: Boolean, default: false },

    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
});
const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
