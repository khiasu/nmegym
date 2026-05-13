"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import MediaUpload from "@/components/MediaUpload";

export default function MediaTester() {
  const [imageId, setImageId] = useState("");

  return (
    <div style={{
      marginTop: "2rem",
      padding: "2rem",
      background: "rgba(255,255,255,0.02)",
      borderRadius: "1rem",
      border: "1px dashed rgba(255,255,255,0.1)"
    }}>
      <h2 style={{ marginBottom: "1rem" }}>Phase 3: Media Upload Test</h2>
      
      {!imageId ? (
        <MediaUpload onUpload={(url) => setImageId(url)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ color: "#22c55e" }}>Upload successful!</p>
          <div style={{ overflow: "hidden", borderRadius: "0.5rem" }}>
            <CldImage
              width="400"
              height="300"
              src={imageId}
              sizes="100vw"
              alt="Uploaded test image"
              crop="fill"
            />
          </div>
          <button 
            onClick={() => setImageId("")}
            style={{
              background: "transparent",
              color: "#fca5a5",
              border: "1px solid rgba(220,38,38,0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "0.4rem",
              cursor: "pointer",
              width: "fit-content"
            }}
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}
