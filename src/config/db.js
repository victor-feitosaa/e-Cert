import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE.ENV === "development"
      ? ["query", "error" , "warn"]
      : ["error"],
});

const connectDB = async () => {
  try{
    await prisma.$connect();
    console.log("DB conectado via Prisma");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.disconnectDB();
};

export {prisma, connectDB, disconnectDB}