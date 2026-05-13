"use client";

import { CldUploadWidget } from "next-cloudinary";

export default function MediaUpload({ onUpload, children }) {
  return (
    <CldUploadWidget
      uploadPreset="nmegym_preset" // You will need to create this in Cloudinary
      onSuccess={(result) => {
        if (result.info && typeof result.info === "object") {
          onUpload(result.info.secure_url);
        }
      }}
    >
      {({ open }) => {
        function handleOnClick(e) {
          e.preventDefault();
          open();
        }
        
        return (
          <div onClick={handleOnClick} style={{ cursor: "pointer", display: "inline-block" }}>
            {children || (
              <button 
                className="auth-btn" 
                style={{ width: "auto", padding: "0.5rem 1rem" }}
              >
                Upload Media
              </button>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
