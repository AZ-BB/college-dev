export type OAuthProvider = "google" | "github" | "facebook" | "twitter" | "discord";

export default {
    confirmation: 'email',
    oauth_types: [
        
    ] as OAuthProvider[]
} as {
    confirmation: 'email' | 'otp' | 'none';
    oauth_types: OAuthProvider[];
}