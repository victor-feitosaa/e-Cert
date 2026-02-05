export const addToSubEvents = async (req, res) => {
    const { eventId, userId, title, description, date, time } = req.body;

    try {
        const subEvent = await prisma.subEvent.create({
            data: {
                eventId,
                userId,
            },
        });
        res.status(201).json(subEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}