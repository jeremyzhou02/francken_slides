import React from "react";

export default function ImageOverwriteModal({ file, onCancel, onConfirm }) {
  if (!file) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Replace Image?</h3>
        <p>
          This will delete the current image and upload{" "}
          <strong>{file.name}</strong>.
        </p>
        <div className="modal-actions">
          <button className="btn-no" onClick={onCancel}>
            No
          </button>
          <button className="btn-yes" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
