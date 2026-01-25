"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { useRouter } from "next/navigation";

interface VideoUploaderProps {
  uploadUrl: string;
}

export default function VideoUploader({ uploadUrl }: VideoUploaderProps) {
  const router = useRouter();

  const handleSuccess = () => {
    // Refresh the page to show the new upload
    router.refresh();
  };

  return <MuxUploader endpoint={uploadUrl} onSuccess={handleSuccess} />;
}
