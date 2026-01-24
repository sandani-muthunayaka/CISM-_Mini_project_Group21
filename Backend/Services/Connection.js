const mongoose = require('mongoose');

const connectDB = async () => {
  try{
    const conn = await mongoose.connect(
      'mongodb+srv://gihani:gihani123@cluster0.joxuj2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    );
    console.log(`MongoDB Connected`);
  }catch(error){
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
