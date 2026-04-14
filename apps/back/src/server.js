import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from "dotenv"
import { connectDB, disconnectDB } from './config/db.js';

import cors from 'cors';      

//import routes
import eventsRoutes from './routes/eventsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import subEventsRoutes from './routes/subEventsRoutes.js';
import userRoutes from "./routes/userRoutes.js"
import testeRoutes from "./routes/testeRoutes.js"

config();
connectDB();

const app = express();

console.log("FRONTEND_URL: ", process.env.FRONTEND_URL);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4321",
  credentials: true,  // necessário pelo credentials: "include" nos cookies JWT
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


//body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//API routes
app.use("/events", eventsRoutes);
app.use("/auth", authRoutes);
app.use("/subevents", subEventsRoutes);
app.use("/user", userRoutes);
app.use("/testes", testeRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API e-Cert - Sistema de Gerenciamento de Eventos',
    version: '1.0.0'
  });
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