"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxPlayerComponentProps {
  playbackId: string;
}

export default function VideoPlayer({ playbackId }: MuxPlayerComponentProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      accentColor="#ac39f2"
      style={{
        width: "100%",
        maxWidth: "100%",
      }}
    />
  );
}
