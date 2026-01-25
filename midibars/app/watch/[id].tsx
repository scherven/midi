import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Mux } from "@mux/mux-node";
import MuxPlayer from "@mux/mux-player-react";

const client = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
});

export const getServerSideProps = (async ({ params }) => {
  const asset = await client.video.assets.retrieve(params!.id as string);

  return { props: { asset } };
}) satisfies GetServerSideProps;

export default function Watch({
  asset,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <h1>Watch Video</h1>
      <MuxPlayer
        playbackId={asset.playback_ids?.[0]?.id}
        accentColor="#ac39f2"
      />
    </div>
  );
}
