// src/config/passport.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import transporter from "./mailer.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value
            ?.toLowerCase()
            .trim();

        if (!email) {
          return done(
            new Error("Google account has no email")
          );
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email },
          ],
        });

        if (user) {
          // Existing account
          let isNewGoogleLink = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            isNewGoogleLink = true;
          }

          if (!user.avatar) {
            user.avatar =
              profile.photos?.[0]?.value || null;
          }

          if (user.authProvider === "local") {
            user.authProvider = "both";
          }

          user.lastLoginAt = new Date();

          await user.save();

          return done(null, user);
        }

        // New Google user
        const userName = profile.displayName || email.split("@")[0];

        user = await User.create({
          name: userName,
          email,
          googleId: profile.id,
          avatar:
            profile.photos?.[0]?.value || null,
          role: "customer",
          authProvider: "google",
          isEmailVerified: true,
          lastLoginAt: new Date(),
        });

        console.log("Sending Welcome mail to: ", email)
        // Send Welcome Email for new Google signups
        try {
          await transporter.sendMail({
            from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Rebel Watches — Rule Your Time",
            html: `
          <div style="background-color: #121212; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #262626; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8); font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
            <!-- Header -->
            <div style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <h2 style="font-family: 'Cinzel', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.25em; color: #ffffff; text-transform: uppercase; margin: 0;">
                Rebel Watches
              </h2>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; color: #737373; margin-top: 6px;">
                Curated Luxury Timepieces
              </div>
            </div>

            <!-- Body Content -->
            <div style="padding: 40px;">
              <h1 style="font-family: 'Cinzel', Georgia, serif; font-size: 26px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.025em; line-height: 1.3;">
                Welcome to the Inner Circle
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 16px;">
                Hello, <strong style="color: #ffffff;">${userName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-top: 0; margin-bottom: 24px;">
                Your account has been successfully created. You now have exclusive access to our handpicked collection of precision timepieces, designed for those who command their own schedule.
              </p>

              <!-- Free Shipping Perk Card -->
              <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border: 1px solid #333333; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4d4d4; margin-bottom: 6px; font-weight: 600;">
                  Exclusive Member Perk
                </div>
                <div style="font-size: 16px; font-family: 'Cinzel', Georgia, serif; color: #ffffff; font-weight: 600; margin-bottom: 4px;">
                  Free Shipping on Your First Order
                </div>
                <p style="font-size: 13px; color: #a3a3a3; margin: 0; line-height: 1.4;">
                  Enjoy complimentary delivery nationwide on your inaugural timepiece selection. Applied automatically at checkout.
                </p>
              </div>

              <!-- Featured Collections Card -->
              <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 24px; margin-bottom: 28px; text-align: center;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #737373; margin-bottom: 8px;">
                  Explore Our Masterpieces
                </div>
                <p style="font-size: 14px; color: #d4d4d4; margin-bottom: 20px;">
                  Discover our latest luxury automatic watches, chronograph editions, and limited-release articles.
                </p>
                <a href="${process.env.CLIENT_URL || 'https://rebelwatches.com'}/products" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; text-decoration: none;">
                  Browse Collection
                </a>
              </div>

              <p style="margin-bottom: 0; font-size: 13px; color: #737373;">
                If you have any questions or need concierge support, simply reply to this email. We're always here to help.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 40px; background-color: #0f0f0f; border-top: 1px solid #1f1f1f; text-align: center;">
              <p style="font-size: 11px; color: #525252; margin: 0; letter-spacing: 0.05em;">
                &copy; 2026 Rebel Watches. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #525252; margin: 6px 0 0 0; letter-spacing: 0.05em;">
                Precision engineered for those who rule their own time.
              </p>
            </div>
          </div>
        `,
          });
        } catch (emailError) {
          console.error("Google welcome email delivery failed:", emailError);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;