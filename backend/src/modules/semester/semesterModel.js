const mongoose = require('mongoose');
const semesterSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isDelete: { type: Boolean, default: false },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
});
const Semester = mongoose.model('Semester', semesterSchema);
module.exports = Semester;
