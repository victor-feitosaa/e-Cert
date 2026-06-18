

export const createCertificate = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
