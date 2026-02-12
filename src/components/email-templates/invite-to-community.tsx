interface InviteToCommunityProps {
  senderName: string;
  communityName: string;
  communityUrl: string;
}

export default function InviteToCommunity({
  senderName,
  communityName,
  communityUrl,
}: InviteToCommunityProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111", marginBottom: "16px" }}>
        You&apos;re Invited!
      </h1>
      <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "16px" }}>
        {senderName} has invited you to join <strong>{communityName}</strong>.
      </p>
      <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "24px" }}>
        Click the link below to accept the invitation and join the community:
      </p>
      <a
        href={communityUrl}
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#f97316",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px",
        }}
      >
        Join {communityName}
      </a>
      <p style={{ fontSize: "14px", color: "#666", marginTop: "24px" }}>
        Or copy and paste this link into your browser:
        <br />
        <a href={communityUrl} style={{ color: "#f97316", wordBreak: "break-all" }}>
          {communityUrl}
        </a>
      </p>
    </div>
  );
}
