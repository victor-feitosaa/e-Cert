import { prisma } from "../config/db.js";

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json({
      status: "success",
      data: { events },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
        message: "Failed to retrieve events",
        error: error.message,
    });
  }
};;