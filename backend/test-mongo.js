import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);
import mongoose from 'mongoose';
const MONGO_URI = 'mongodb+srv://user2000:test1234@userandall.6pzpu9z.mongodb.net/?appName=Userandall';

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000 
}).then(() => {
  console.log(' Connected to MongoDB Atlas successfully!');
  console.log('Database Name: savatsya_gau_samvardhan');
  process.exit(0);
}).catch(err => {
  console.error(' Error connecting to MongoDB Atlas:', err);
  process.exit(1);
});
