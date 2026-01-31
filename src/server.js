import express from 'express';
import { config } from "dotenv"
import { connectDB } from './config/db.js';

//import routes
import eventsRoutes from './routes/eventsRoutes.js';
import authRoutes from './routes/authRoutes.js';

config();
connectDB();

const app = express();

//body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API routes
app.use("/events", eventsRoutes);
app.use("/auth", authRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


//funcoes feitas pra controle de erros
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection: ", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

//handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception: ", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown on SIGTERM and SIGINT
process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    await disconnectDB();
    process.exit(0);
});