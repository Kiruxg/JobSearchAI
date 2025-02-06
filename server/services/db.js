const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DatabaseService {
    // User operations
    async createUser(email, name) {
        return prisma.user.create({
            data: {
                email,
                name,
            },
        });
    }

    async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                subscription: true,
                platforms: true,
            },
        });
    }

    // Subscription operations
    async createSubscription(userId, stripeData) {
        return prisma.subscription.create({
            data: {
                userId,
                stripeCustomerId: stripeData.customerId,
                stripeSubscriptionId: stripeData.subscriptionId,
                status: 'active',
                plan: 'premium',
                currentPeriodEnd: new Date(stripeData.currentPeriodEnd * 1000),
            },
        });
    }

    async updateSubscription(subscriptionId, data) {
        return prisma.subscription.update({
            where: { id: subscriptionId },
            data,
        });
    }

    // Platform connection operations
    async createPlatformConnection(userId, platform, tokenData) {
        return prisma.platformConnection.create({
            data: {
                userId,
                platform,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                profileData: tokenData.profile,
            },
        });
    }

    async updatePlatformConnection(userId, platform, tokenData) {
        return prisma.platformConnection.update({
            where: {
                userId_platform: {
                    userId,
                    platform,
                },
            },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            },
        });
    }

    // Job application operations
    async createJobApplication(userId, applicationData) {
        return prisma.jobApplication.create({
            data: {
                userId,
                ...applicationData,
                dateApplied: new Date(applicationData.dateApplied),
            },
        });
    }

    async getJobApplications(userId) {
        return prisma.jobApplication.findMany({
            where: { userId },
            orderBy: { dateApplied: 'desc' },
        });
    }
}

module.exports = new DatabaseService(); 