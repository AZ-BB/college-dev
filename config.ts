export type OAuthProvider = "google" | "github" | "facebook" | "twitter" | "discord";

export default {
    confirmation: 'none',
    oauth_types: [
        "google",
    ] as OAuthProvider[]
} as {
    confirmation: 'email' | 'otp' | 'none';
    oauth_types: OAuthProvider[];
}