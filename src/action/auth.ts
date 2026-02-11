'use server'

import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/utils/supabase-server";
import config, { OAuthProvider } from "../../config"

/**
 * Sanitize username to be URL-safe by removing/replacing invalid characters
 * Allows only alphanumeric characters, hyphens, and underscores
 */
function sanitizeUsername(username: string): string {
    return username
        // Convert to lowercase for consistency
        .toLowerCase()
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove any character that's not alphanumeric, hyphen, or underscore
        .replace(/[^a-z0-9\-_]/g, '')
        // Remove leading/trailing hyphens and underscores
        .replace(/^[-_]+|[-_]+$/g, '');
}

/**
 * Generate a unique username by checking if it already exists
 * If the base username is taken, append a random number
 * Ensures the username is URL-safe
 */
async function generateUniqueUsername(baseUsername: string, supabaseClient: any): Promise<string | null> {
    try {
        // Sanitize the base username to ensure it's URL-safe
        let sanitizedUsername = sanitizeUsername(baseUsername);

        // If sanitization resulted in an empty string, return null
        if (!sanitizedUsername || sanitizedUsername.length === 0) {
            console.warn("Username became empty after sanitization:", baseUsername);
            return null;
        }

        // Check if sanitized base username exists
        const { data: existingUser } = await supabaseClient
            .from("users")
            .select("username")
            .eq("username", sanitizedUsername)
            .single();

        // If base username doesn't exist, use it
        if (!existingUser) {
            return sanitizedUsername;
        }

        // Try adding random numbers until we find an available username
        for (let i = 0; i < 10; i++) {
            const randomNum = Math.floor(Math.random() * 10000);
            const newUsername = `${sanitizedUsername}${randomNum}`;

            const { data: user } = await supabaseClient
                .from("users")
                .select("username")
                .eq("username", newUsername)
                .single();

            if (!user) {
                return newUsername;
            }
        }

        // If we couldn't find a unique username after 10 attempts
        return null;
    } catch (error) {
        // If there's an error checking for existing username, return null
        console.error("Error generating unique username:", error);
        return null;
    }
}

export async function registerUser(formData: FormData): Promise<GeneralResponse<boolean>> {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return { error: "All fields are required", statusCode: 400, data: false };
        }

        const supabaseAdmin = await createSupabaseAdminServerClient();
        const supabaseClient = await createSupabaseServerClient();

        const { data: isEmailExists } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (isEmailExists) {
            return { error: "Email already exists", statusCode: 400, data: false };
        }

        // Generate a default username from email
        const baseUsername = email.split('@')[0];
        const uniqueUsername = await generateUniqueUsername(baseUsername, supabaseAdmin);

        if (!uniqueUsername) {
            return { error: "Unable to generate a unique username. Please try again.", statusCode: 400, data: false };
        }

        // Email confirmation flow
        if (config.confirmation === 'email') {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                }
            })

            if (error) {
                return { error: error.message, statusCode: 400, data: false };
            }

            // Create user in database
            try {
                await supabaseAdmin.from("users").insert({
                    id: data.user?.id!,
                    email,
                    username: uniqueUsername,
                    first_name: "",
                    last_name: "",
                    is_active: false,
                })
            }
            catch (error: any) {
                // Cleanup: delete the auth user if database insert fails
                await supabaseAdmin.auth.admin.deleteUser(data.user?.id!);
                console.error("Error creating user in database:", error);
                
                // Check if it's a unique constraint violation on username
                if (error.code === '23505' && error.message?.includes('username')) {
                    return { error: "Username is already taken. Please try again.", statusCode: 400, data: false };
                }
                
                return { error: "Failed to create user", statusCode: 400, data: false };
            }

            return { data: true, statusCode: 200, error: undefined, message: "Registration successful. Please check your email to confirm your account." };
        }

        // No confirmation flow
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (error) {
            return { error: error.message, statusCode: 400, data: false };
        }

        // Create user in database
        try {
            await supabaseAdmin.from('users').insert({
                id: data.user?.id,
                email: email,
                username: uniqueUsername,
                first_name: "",
                last_name: "",
                is_active: false,
            })
        }
        catch (error: any) {
            await supabaseAdmin.auth.admin.deleteUser(data.user?.id);
            console.error("Error creating user in database:", error);
            
            // Check if it's a unique constraint violation on username
            if (error.code === '23505' && error.message?.includes('username')) {
                return { error: "Username is already taken. Please try again.", statusCode: 400, data: false };
            }
            
            return { error: "Failed to create user", statusCode: 400, data: false };
        }

        await supabaseClient.auth.signInWithPassword({
            email,
            password,
        })

        return { data: true, statusCode: 200, error: undefined, message: "Registration successful" };
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to register", statusCode: 500, data: false };
    }
}


export async function sendResetPasswordEmail(email: string): Promise<GeneralResponse<boolean>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=recovery`
        })

        if (error) {
            return { error: error.message, statusCode: 400, data: false };
        }

        return { data: true, statusCode: 200, error: undefined, message: "Reset password email sent" };
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to send reset password email", statusCode: 500, data: false };
    }
}

export async function resetPassword(code: string, newPassword: string): Promise<GeneralResponse<boolean>> {
    try {
        if (!code || !newPassword) {
            return { error: "Code and password are required", statusCode: 400, data: false };
        }

        if (newPassword.length < 8) {
            return { error: "Password must be at least 8 characters long", statusCode: 400, data: false };
        }

        const supabase = await createSupabaseServerClient();

        // Exchange code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            return { error: exchangeError.message || "Invalid or expired reset code", statusCode: 400, data: false };
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return { error: updateError.message, statusCode: 400, data: false };
        }

        return { data: true, statusCode: 200, error: undefined, message: "Password reset successfully" };
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to reset password", statusCode: 500, data: false };
    }
}

export async function updatePassword(newPassword: string): Promise<GeneralResponse<boolean>> {
    try {
        if (!newPassword) {
            return { error: "Password is required", statusCode: 400, data: false };
        }

        if (newPassword.length < 8) {
            return { error: "Password must be at least 8 characters long", statusCode: 400, data: false };
        }

        const supabase = await createSupabaseServerClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { error: "Not authenticated", statusCode: 401, data: false };
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return { error: updateError.message, statusCode: 400, data: false };
        }

        return { data: true, statusCode: 200, error: undefined, message: "Password updated successfully" };
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to update password", statusCode: 500, data: false };
    }
}

export async function signInWithGoogleUser(nextPath: string): Promise<GeneralResponse<string | null>> {
    try {
        const supabase = await createSupabaseServerClient();
        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const callbackUrl = `${origin}/auth/callback?provider=google` + (nextPath ? encodeURIComponent(`&next=${nextPath}`) : '');

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: callbackUrl
            }
        })

        if (error) {
            return { error: error.message, statusCode: 400, data: null };
        }

        return { data: data.url, statusCode: 200, error: undefined, message: "Sign in successful" };
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to sign in", statusCode: 500, data: null };
    }
}

export async function handleOAuthCallback(provider: string): Promise<GeneralResponse<boolean>> {
    try {

        const supabase = await createSupabaseServerClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (provider !== 'google') {
            const supabaseAdmin = await createSupabaseAdminServerClient();
            const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user?.id!);
            if (deleteUserError) {
                return { error: deleteUserError.message, statusCode: 400, data: false };
            }
            return { error: "Invalid provider", statusCode: 400, data: false };
        }

        if (error) {
            return { error: error.message, statusCode: 400, data: false };
        }

        const { data: isUserExists } = await supabase.from("users").select('*').eq('id', user?.id!).single();

        if (isUserExists) {
            return { data: false, statusCode: 200, error: undefined, message: "User already exists" };
        }

        // Generate username from email or full name
        const email = user?.email!;
        const baseUsername = user?.user_metadata?.full_name?.split(' ')[0]?.toLowerCase() || email.split('@')[0];
        const supabaseAdmin = await createSupabaseAdminServerClient();
        const uniqueUsername = await generateUniqueUsername(baseUsername, supabaseAdmin);

        if (!uniqueUsername) {
            // If we can't generate a unique username, delete the OAuth user
            await supabaseAdmin.auth.admin.deleteUser(user?.id!);
            return { error: "Unable to generate a unique username. Please try again.", statusCode: 400, data: false };
        }

        try {
            await supabase.from("users").insert({
                id: user?.id!,
                username: uniqueUsername,
                first_name: user?.user_metadata?.full_name?.split(' ')[0] || "",
                last_name: user?.user_metadata?.full_name?.split(' ')[1] || "",
                email: email,
                avatar_url: user?.user_metadata?.avatar_url,
            })
        }
        catch (error: any) {
            // Cleanup: delete the OAuth user if database insert fails
            await supabaseAdmin.auth.admin.deleteUser(user?.id!);
            console.error("Error creating user in database:", error);
            
            // Check if it's a unique constraint violation on username
            if (error.code === '23505' && error.message?.includes('username')) {
                return { error: "Username is already taken. Please try again.", statusCode: 400, data: false };
            }
            
            return { error: "Failed to create user", statusCode: 400, data: false };
        }

        return { data: true, statusCode: 200, error: undefined, message: "User created successfully" };


    } catch (error) {
        console.error(error);
        return { error: "Failed to handle OAuth callback", statusCode: 500, data: false };
    }
}

// Resend OTP using Supabase's built-in functionality
export async function resendOTP(email: string): Promise<GeneralResponse<boolean>> {
    try {
        const supabase = await createSupabaseServerClient();
        
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false, // Don't create user on resend
            }
        });

        if (error) {
            return { error: error.message, statusCode: 400, data: false };
        }

        return {
            data: true,
            statusCode: 200,
            error: undefined,
            message: "OTP sent successfully"
        };
    } catch (error) {
        console.error(error);
        return { error: "Failed to resend OTP", statusCode: 500, data: false };
    }
}

// Verify OTP code using Supabase's built-in functionality
export async function verifyOTP(email: string, otpCode: string): Promise<GeneralResponse<boolean>> {
    try {
        const supabase = await createSupabaseServerClient();
        const supabaseAdmin = await createSupabaseAdminServerClient();
        
        // Verify OTP with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otpCode,
            type: 'email'
        });

        if (error) {
            return { error: error.message || "Invalid OTP code", statusCode: 400, data: false };
        }

        if (!data.user) {
            return { error: "Verification failed", statusCode: 400, data: false };
        }

        // Create user in public.users table if doesn't exist
        const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .single();

        if (!existingUser) {
            const email = data.user.email!;
            const baseUsername = email.split('@')[0];
            const uniqueUsername = await generateUniqueUsername(baseUsername, supabaseAdmin);

            if (!uniqueUsername) {
                return { error: "Unable to generate a unique username. Please try again.", statusCode: 400, data: false };
            }

            try {
                await supabaseAdmin.from("users").insert({
                    id: data.user.id,
                    email: email,
                    username: uniqueUsername,
                    first_name: "",
                    last_name: "",
                });
            }
            catch (error: any) {
                console.error("Error creating user in database:", error);
                
                // Check if it's a unique constraint violation on username
                if (error.code === '23505' && error.message?.includes('username')) {
                    return { error: "Username is already taken. Please try again.", statusCode: 400, data: false };
                }
                
                return { error: "Failed to create user during OTP verification", statusCode: 400, data: false };
            }
        }

        return {
            data: true,
            statusCode: 200,
            error: undefined,
            message: "OTP verified successfully"
        };
    } catch (error) {
        console.error(error);
        return { error: "Failed to verify OTP", statusCode: 500, data: false };
    }
}

// Check if user profile is complete (has first_name, last_name, and username)
export async function isProfileComplete(userId: string): Promise<GeneralResponse<{ isComplete: boolean; needsOnboarding: boolean }>> {
    try {
        const supabaseAdmin = await createSupabaseAdminServerClient();
        
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("first_name, last_name, username, is_active")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return { 
                error: "Failed to check profile status", 
                statusCode: 500, 
                data: { isComplete: false, needsOnboarding: true } 
            };
        }

        const isComplete = !!(user?.first_name && user?.last_name && user?.username && user?.is_active);

        return {
            data: { 
                isComplete,
                needsOnboarding: !isComplete 
            },
            statusCode: 200,
            error: undefined
        };
    } catch (error) {
        console.error(error);
        return { 
            error: "Failed to check profile status", 
            statusCode: 500, 
            data: { isComplete: false, needsOnboarding: true } 
        };
    }
}

// Update user profile information
export async function completeUserProfile(
    firstName: string, 
    lastName: string, 
    bio: string, 
    avatarUrl?: string,
    username?: string
): Promise<GeneralResponse<boolean>> {
    try {
        const supabase = await createSupabaseServerClient();
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return { error: "Not authenticated", statusCode: 401, data: false };
        }

        if (!firstName || !lastName) {
            return { error: "First name and last name are required", statusCode: 400, data: false };
        }

        // Update user profile in database
        const updateData: any = {
            first_name: firstName,
            last_name: lastName,
            bio: bio || undefined,
            is_active: true,
        };

        // Add username if provided
        if (username) {
            updateData.username = username;
        }

        // Add avatar_url if provided
        if (avatarUrl) {
            updateData.avatar_url = avatarUrl;
        }

        const { error: updateError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id);

        if (updateError) {
            console.error("Error updating user profile:", updateError);
            return { error: "Failed to update profile", statusCode: 500, data: false };
        }

        return {
            data: true,
            statusCode: 200,
            error: undefined,
            message: "Profile updated successfully"
        };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update profile", statusCode: 500, data: false };
    }
}