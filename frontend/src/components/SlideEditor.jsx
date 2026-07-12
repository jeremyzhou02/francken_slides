import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import SlidePreview from "./SlidePreview";
import SlideFormFields from "./SlideFormFields";
import ImageOverwriteModal from "./ImageOverwriteModal";
import "./Dashboard.css";
import "./EditSlides.css";
import {
  buildSettings,
  emptyForm,
  getPublicFilename,
  parseGoogleSheetId,
  settingsFromSlide,
  validateSlideForm,
} from "./slideFormUtils";
import {
  createSlide,
  fetchAgendaPreview,
  fetchQuotePreview,
  fetchSlide,
  replaceImage,
  updateSlide,
  uploadImage,
} from "./slideApi";

export default function SlideEditor({ token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = id === "new";
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replacementFilename, setReplacementFilename] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [quotePreview, setQuotePreview] = useState(null);
  const [quotePreviewError, setQuotePreviewError] = useState("");
  const [agendaPreviewItems, setAgendaPreviewItems] = useState([]);
  const [agendaPreviewError, setAgendaPreviewError] = useState("");
  const [pendingOverwriteFile, setPendingOverwriteFile] = useState(null);
  const [pendingOverwritePreview, setPendingOverwritePreview] = useState("");
  const [newPreferredTime, setNewPreferredTime] = useState("");
  const [displayId, setDisplayId] = useState("");
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const pageTitle = useMemo(
    () => {
      if (isCreateMode) return "Create slide";
      return displayId ? `Editing slide #${displayId}` : "Editing slide";
    },
    [displayId, isCreateMode],
  );

  useEffect(() => {
    if (isCreateMode) {
      setForm(emptyForm);
      setSelectedFile(null);
      setReplacementFilename("");
      setPreviewUrl("");
      setDisplayId("");
      setIsLoading(false);
      return;
    }

    const loadSlide = async () => {
      setIsLoading(true);
      setError("");

      try {
        const slide = await fetchSlide(baseUrl, token, id);
        const nextForm = settingsFromSlide(slide, baseUrl);
        setForm(nextForm);
        setDisplayId(slide.displayId || "");
        setPreviewUrl(nextForm.imageUrl);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this slide.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSlide();
  }, [baseUrl, id, isCreateMode, token]);

  useEffect(() => {
    if (form.type !== "quote") {
      setQuotePreview(null);
      setQuotePreviewError("");
      return undefined;
    }

    if (!parseGoogleSheetId(form.googleSheetUrl)) {
      setQuotePreview(null);
      setQuotePreviewError("");
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const items = await fetchQuotePreview(baseUrl, token, form.googleSheetUrl);
        setQuotePreview(items[0] || null);
        setQuotePreviewError(
          items.length > 0 ? "" : "No quote rows found in this sheet.",
        );
      } catch (err) {
        setQuotePreview(null);
        setQuotePreviewError(
          err.response?.data?.message || "Could not load quotes from this sheet.",
        );
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [baseUrl, form.googleSheetUrl, form.type, token]);

  useEffect(() => {
    if (form.type !== "agenda") {
      setAgendaPreviewItems([]);
      setAgendaPreviewError("");
      return undefined;
    }

    if (!form.calendarId.trim()) {
      setAgendaPreviewItems([]);
      setAgendaPreviewError("");
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const items = await fetchAgendaPreview(baseUrl, token, form.calendarId);
        setAgendaPreviewItems(items);
        setAgendaPreviewError(
          items.length > 0 ? "" : "No upcoming events found.",
        );
      } catch (err) {
        setAgendaPreviewItems([]);
        setAgendaPreviewError(
          err.response?.data?.message ||
            "Could not load events from this calendar.",
        );
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [baseUrl, form.calendarId, form.type, token]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const existingFilename = getPublicFilename(form.imageUrl);

    if (existingFilename) {
      setPendingOverwriteFile(file);
      setPendingOverwritePreview(URL.createObjectURL(file));
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setReplacementFilename("");
    setPreviewUrl(URL.createObjectURL(file));
    updateField("imageUrl", "");
  };

  const confirmImageOverwrite = () => {
    setSelectedFile(pendingOverwriteFile);
    setReplacementFilename(getPublicFilename(form.imageUrl));
    setPreviewUrl(pendingOverwritePreview);
    setPendingOverwriteFile(null);
    setPendingOverwritePreview("");
  };

  const cancelImageOverwrite = () => {
    setPendingOverwriteFile(null);
    setPendingOverwritePreview("");
  };

  const uploadImageIfNeeded = async () => {
    if (form.type !== "image" || !selectedFile) {
      return form.imageUrl;
    }

    if (replacementFilename) {
      return replaceImage(baseUrl, token, replacementFilename, selectedFile);
    }

    return uploadImage(baseUrl, token, selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationMessage = validateSlideForm(form, previewUrl);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSaving(true);

    try {
      const imageUrl = await uploadImageIfNeeded();
      const nextForm = { ...form, imageUrl };

      const payload = {
        title: nextForm.title.trim(),
        description: nextForm.description.trim(),
        type: nextForm.type,
        duration: Number(nextForm.duration),
        frequency: nextForm.frequency,
        settings: buildSettings(nextForm),
      };

      if (isCreateMode) {
        await createSlide(baseUrl, token, payload);
      } else {
        await updateSlide(baseUrl, token, id, payload);
      }

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not save this slide.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-dashboard-container slide-editor-page">
      <Header onLogout={onLogout} title={pageTitle} />

      <main className="admin-main-stage">
        <form className="editor-container" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="editor-status">Loading slide...</div>
          ) : (
            <div className="editor-grid">
              <SlidePreview
                previewUrl={previewUrl}
                slideType={form.type}
                quotePreview={quotePreview}
                quotePreviewError={quotePreviewError}
                agendaItems={agendaPreviewItems}
                agendaPreviewError={agendaPreviewError}
                onFileChange={handleFileChange}
              />
              <SlideFormFields
                error={error}
                form={form}
                updateField={updateField}
                newPreferredTime={newPreferredTime}
                setNewPreferredTime={setNewPreferredTime}
                isSaving={isSaving}
                isCreateMode={isCreateMode}
                onCancel={() => navigate("/admin")}
              />
            </div>
          )}
        </form>
      </main>

      <ImageOverwriteModal
        file={pendingOverwriteFile}
        onCancel={cancelImageOverwrite}
        onConfirm={confirmImageOverwrite}
      />
    </div>
  );
}
