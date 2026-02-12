export function isValidRedirect(path: string): boolean {
    return path.startsWith("/") && !path.startsWith("//");
}
