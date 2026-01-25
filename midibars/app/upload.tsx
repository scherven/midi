import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { Mux } from "@mux/mux-node";
import MuxUploader from "@mux/mux-uploader-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

const client = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
});

export const getServerSideProps = (async () => {
  // Create upload URL
  const directUpload = await client.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  // Get all assets
  const assets = await client.video.assets.list({ limit: 100 });

  return {
    props: {
      uploadUrl: directUpload.url,
      uploadId: directUpload.id,
      assets: assets,
    },
  };
}) satisfies GetServerSideProps;

export default function Upload({
  uploadUrl,
  uploadId,
  assets,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show the new upload
    router.replace(router.asPath);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1>Video Upload & Library</h1>

      {/* Upload Section */}
      <div
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Upload New Video</h2>
        <MuxUploader endpoint={uploadUrl} onSuccess={handleSuccess} />
      </div>

      {/* Video List Section */}
      <div>
        <h2>Video Library ({assets.length} videos)</h2>
        {assets.length === 0 ? (
          <p>No videos uploaded yet. Upload your first video above!</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {assets.map((asset) => (
              <Link
                key={asset.id}
                href={`/watch/${asset.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Thumbnail */}
                  {asset.playback_ids?.[0]?.id && (
                    <Image
                      src={`https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg?width=400&height=225&fit_mode=smartcrop`}
                      alt="Video thumbnail"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "4px",
                        marginBottom: "10px",
                      }}
                    />
                  )}

                  {/* Video Info */}
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                      {asset.id}
                    </h3>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Status:</strong>{" "}
                        <span
                          style={{
                            color:
                              asset.status === "ready" ? "green" : "orange",
                            fontWeight: "500",
                          }}
                        >
                          {asset.status}
                        </span>
                      </p>
                      {asset.duration && (
                        <p style={{ margin: "4px 0" }}>
                          <strong>Duration:</strong>{" "}
                          {Math.round(asset.duration)}s
                        </p>
                      )}
                      {asset.created_at && (
                        <p style={{ margin: "4px 0" }}>
                          <strong>Created:</strong>{" "}
                          {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
