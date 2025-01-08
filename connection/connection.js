const mongoose = require('mongoose');

async function connectMongoDb() {
    try {
        const dbUri = process.env.MONGO_URI; // Load MongoDB URI from environment variable
        await mongoose.connect(dbUri); // No need for useNewUrlParser and useUnifiedTopology in version 4.0.0+

        console.log("Connected to MongoDB successfully!");

        // MongoDB connection event listeners for better error handling and reliability
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connection established");
        });

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("MongoDB connection lost");
        });
        
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        // Retry logic in case of failure
        setTimeout(connectMongoDb, 5000); // Retry after 5 seconds
    }
}

module.exports = {
    connectMongoDb,
};
