app.post('/webhooks/linkedin', async (req, res) => {
    const { type, data } = req.body;

    switch (type) {
        case 'APPLICATION_UPDATE':
            await updateApplicationStatus(data);
            break;
        case 'NEW_APPLICATION':
            await createNewApplication(data);
            break;
        case 'TOKEN_EXPIRING':
            await refreshAccessToken(data.userId);
            break;
    }

    res.sendStatus(200);
}); 