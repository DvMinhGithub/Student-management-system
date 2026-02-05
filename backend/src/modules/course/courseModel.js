const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }],
});
module.exports = Course = mongoose.model('Course', courseSchema);
