class InterviewScheduler {
    async scheduleInterview(applicationId, interviewDetails) {
        // Create calendar event
        const event = await this.createCalendarEvent(interviewDetails);
        
        // Send confirmation emails
        await this.sendConfirmationEmails(interviewDetails);
        
        // Update application status
        await this.updateApplicationStatus(applicationId, 'interview-scheduled');
        
        // Set reminders
        await this.setReminders(event);
    }
} 