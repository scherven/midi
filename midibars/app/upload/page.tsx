import { Mux } from "@mux/mux-node";
import VideoUploader from "../components/VideoUploader";
import VideoThumbnail from "../components/VideoThumbnail";

const client = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
});

export default async function UploadPage() {
  const directUpload = await client.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  const assetsResponse = await client.video.assets.list({ limit: 100 });
  const assets = assetsResponse.data || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1>Video Upload & Library</h1>

      <div
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Upload New Video</h2>
        <VideoUploader uploadUrl={directUpload.url} />
      </div>

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
              <VideoThumbnail key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
