'use server'

import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/utils/supabase-server";
import config, { OAuthProvider } from "../../config"
import { eq } from "drizzle-orm";
import { SystemRoles } from "@/enums/SystemRoles";

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

        // Email confirmation flow
        if (config.confirmation === 'email') {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                    data: {
                        role: SystemRoles.ADMIN
                    }
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
                    role: SystemRoles.ADMIN
                })
            }
            catch (error) {
                // Cleanup: delete the auth user if database insert fails
                await supabaseAdmin.auth.admin.deleteUser(data.user?.id!);
                return { error: "Failed to create user", statusCode: 400, data: false };
            }

            return { data: true, statusCode: 200, error: undefined, message: "Registration successful. Please check your email to confirm your account." };
        }

        // OTP confirmation flow
        if (config.confirmation === 'otp') {
            // Use Supabase's built-in OTP via email
            const { data, error } = await supabaseClient.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    data: {
                        role: SystemRoles.ADMIN
                    }
                }
            })

            if (error) {
                return { error: error.message, statusCode: 400, data: false };
            }

            // Note: User will be created in auth.users but not in public.users until OTP is verified
            // We'll create the public.users record after OTP verification

            return { data: true, statusCode: 200, error: undefined, message: "Registration successful. Please check your email for OTP code." };
        }

        // No confirmation flow
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: SystemRoles.ADMIN
            }
        })

        if (error) {
            return { error: error.message, statusCode: 400, data: false };
        }

        // Create user in database
        try {
            const { data: userData, error: userError } = await supabaseAdmin.from('users').insert({
                id: data.user?.id,
                email: email,
                role: SystemRoles.ADMIN
                
            })
        }
        catch (error) {
            await supabaseAdmin.auth.admin.deleteUser(data.user?.id);
            return { error: "Failed to create user", statusCode: 400, data: false };
        }

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

        await supabase.from("users").insert({
            id: user?.id!,
            first_name: user?.user_metadata?.full_name?.split(' ')[0],
            last_name: user?.user_metadata?.full_name?.split(' ')[1],
            email: user?.email!,
            avatar_url: user?.user_metadata?.avatar_url,
            role: SystemRoles.USER
        })

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
            await supabaseAdmin.from("users").insert({
                id: data.user.id,
                email: data.user.email!,
                role: SystemRoles.ADMIN
            });
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

// Check if user profile is complete (has first_name and last_name)
export async function isProfileComplete(userId: string): Promise<GeneralResponse<{ isComplete: boolean; needsOnboarding: boolean }>> {
    try {
        const supabaseAdmin = await createSupabaseAdminServerClient();
        
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("first_name, last_name")
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

        const isComplete = !!(user?.first_name && user?.last_name);

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

// Upload avatar to Supabase Storage
export async function uploadAvatar(file: File, userId: string): Promise<GeneralResponse<{ url: string } | null>> {
    try {
        const supabase = await createSupabaseServerClient();
        
        // Generate unique filename with user folder
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Error uploading avatar:", uploadError);
            return { error: "Failed to upload avatar", statusCode: 500, data: null };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return {
            data: { url: publicUrl },
            statusCode: 200,
            error: undefined,
            message: "Avatar uploaded successfully"
        };
    } catch (error) {
        console.error(error);
        return { error: "Failed to upload avatar", statusCode: 500, data: null };
    }
}

// Update user profile information
export async function updateUserProfile(
    firstName: string, 
    lastName: string, 
    bio: string, 
    avatarUrl?: string
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
        };

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