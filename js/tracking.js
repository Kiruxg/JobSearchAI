class ApplicationTracker {
    async trackProgress(applicationId) {
        const application = await this.getApplication(applicationId);
        
        // Check for updates
        const updates = await Promise.all([
            this.checkEmailForUpdates(application),
            this.checkPortalStatus(application),
            this.checkForInterviewInvites(application)
        ]);

        if (updates.some(update => update.hasChanged)) {
            await this.updateApplicationStatus(applicationId, updates);
            await this.notifyUser(updates);
        }
    }
} 