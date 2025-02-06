class ApplicationSyncService {
    async syncLinkedInApplications(userId) {
        const connection = await PlatformConnection.findOne({ 
            userId, 
            platform: 'linkedin' 
        });

        if (!connection) return;

        try {
            const applications = await this.fetchLinkedInApplications(connection.access_token);
            await this.updateLocalApplications(userId, applications);
        } catch (error) {
            if (error.status === 401) {
                await this.refreshToken(connection);
                // Retry sync
            }
            throw error;
        }
    }

    async updateLocalApplications(userId, applications) {
        for (const app of applications) {
            await PlatformApplication.upsert({
                userId,
                platformJobId: app.id,
                company: app.company,
                position: app.title,
                status: this.mapStatus(app.status),
                dateApplied: app.applicationDate,
                lastSyncedAt: new Date()
            });
        }
    }
} 