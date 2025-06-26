import mongoose from "mongoose";


type ConnectOptions = {
    isConnected?: number;
}

const connection: ConnectOptions = {};

async function dbConnect() : Promise<void> {
    if (connection.isConnected) {
        // Use existing connection
        console.log("Using existing database connection");
        return;
    } // this is important to avoid multiple connections
    // and we should do in next.js

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI as string);

        connection.isConnected = db.connections[0].readyState;

        console.log("New database connection established");
    }
    catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to the database");

        process.exit(1);
    }
}

export default dbConnect;