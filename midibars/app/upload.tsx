import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

import { Mux } from "@mux/mux-node";
import Upload from "@mux/mux-node";
import MuxUploader from "@mux/mux-uploader-react";

const client = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
});

export const getServerSideProps = (async () => {
  const directUpload = await client.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["public"],
    },
  });

  return {
    props: {
      directUpload,
    },
  };
}) satisfies GetServerSideProps<{ directUpload: Upload }>;

export default function Page({
  directUpload,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <MuxUploader endpoint={directUpload.url} />;
}
