const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const connectDatabase = () => {
    mongoose
        .connect(process.env.DB_URL)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.log('MongoDB connection error:', err));
};
module.exports = connectDatabase;
