import React from "react";
import AgendaSlide from "./AgendaSlide";

function QuotePreview({ quotePreview, quotePreviewError }) {
  return (
    <div className="editor-quote-preview">
      <img
        src="/francken.png"
        alt=""
        className="editor-quote-preview-logo"
        aria-hidden="true"
      />
      <div className="editor-quote-preview-content">
        {quotePreview ? (
          <p>
            {quotePreview.quote} <span>~</span> {quotePreview.name}
          </p>
        ) : (
          <p>{quotePreviewError || "Enter a Google Sheet URL to preview row 1"}</p>
        )}
      </div>
    </div>
  );
}

export default function SlidePreview({
  previewUrl,
  slideType,
  quotePreview,
  quotePreviewError,
  agendaItems,
  agendaPreviewError,
  onFileChange,
}) {
  return (
    <div className="editor-left-column">
      <div className="image-preview-box landscape">
        {slideType === "quote" ? (
          <QuotePreview
            quotePreview={quotePreview}
            quotePreviewError={quotePreviewError}
          />
        ) : slideType === "agenda" ? (
          <AgendaSlide
            items={agendaItems}
            isPreview
            message={
              agendaPreviewError || "Enter a Google Calendar ID to preview events"
            }
          />
        ) : previewUrl ? (
          <img src={previewUrl} alt="Slide preview" />
        ) : (
          <div className="placeholder-text">Landscape Preview</div>
        )}
      </div>

      {slideType === "image" && (
        <>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            hidden
            onChange={onFileChange}
          />
          <label htmlFor="fileUpload" className="upload-btn">
            {previewUrl ? "Change Photo" : "Upload Photo"}
          </label>
        </>
      )}
    </div>
  );
}
