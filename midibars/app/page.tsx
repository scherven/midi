import Mux from "@mux/mux-node";
import MuxUploader from "@mux/mux-uploader-react";

const client = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
});

export default async function Page() {
  const directUpload = await client.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  return <MuxUploader endpoint={directUpload.url} />;
}
