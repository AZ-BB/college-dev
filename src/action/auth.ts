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
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;

        if (!email || !password || !firstName || !lastName) {
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
                        firstName,
                        lastName,
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
                    first_name: firstName,
                    last_name: lastName,
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
            // TODO
        }

        // No confirmation flow
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                firstName,
                lastName,
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
                first_name: firstName,
                last_name: lastName,
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
