import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);

    if (error.reason) {
      console.error('Reason:', error.reason);
    }

    process.exit(1);
  }
};

export default connectDB;