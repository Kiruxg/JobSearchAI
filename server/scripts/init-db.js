const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initializeDatabase() {
    try {
        // Create indexes
        await prisma.$executeRaw`
            CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON "JobApplication"("userId");
            CREATE INDEX IF NOT EXISTS idx_platform_connections_user_platform ON "PlatformConnection"("userId", "platform");
        `;

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

initializeDatabase(); 