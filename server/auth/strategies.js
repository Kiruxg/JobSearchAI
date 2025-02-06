const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Local Strategy (Email/Password)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    googleId: profile.id,
                    avatar: profile.photos[0]?.value
                }
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { linkedinId: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    linkedinId: profile.id,
                    avatar: profile.photos[0]?.value
                }
            });
        }

        // Store OAuth tokens for job board integration
        await prisma.platformConnection.upsert({
            where: {
                userId_platform: {
                    userId: user.id,
                    platform: 'linkedin'
                }
            },
            update: {
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            },
            create: {
                userId: user.id,
                platform: 'linkedin',
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        });

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport; 