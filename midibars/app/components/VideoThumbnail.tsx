"use client";

import Image from "next/image";
import Link from "next/link";

export default function VideoThumbnail({ asset }: { asset: any }) {
  return (
    <Link
      key={asset.id}
      href={`/edit/${asset.id}`}
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
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {asset.playback_ids?.[0]?.id && (
          <Image
            src={`https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg?width=400&height=225&fit_mode=smartcrop`}
            alt="Video thumbnail"
            width={200}
            height={200}
          />
        )}

        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>{asset.id}</h3>
          <div style={{ fontSize: "14px", color: "#666" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: asset.status === "ready" ? "green" : "orange",
                  fontWeight: "500",
                }}
              >
                {asset.status}
              </span>
            </p>
            {asset.duration && (
              <p style={{ margin: "4px 0" }}>
                <strong>Duration:</strong> {Math.round(asset.duration)}s
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
  );
}
