import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import Header from "./Header";
import Table from "./Table";
import DeleteModal from "./DeleteModal";

export default function Dashboard({ token, onLogout }) {
  // Variable to save slides data
  const [slides, setSlides] = useState([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);
  const [slidesError, setSlidesError] = useState("");

  // For deleting confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: "",
  });

  // Once webpage loads, we retrieve data from server
  useEffect(() => {
    const fetchSlides = async () => {
      setIsLoadingSlides(true);
      setSlidesError("");

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/slides`, {
          headers: { token: token },
        });
        setSlides(response.data);
      } catch (error) {
        console.error("Error fetching slides:", error);
        setSlidesError("Could not load slides.");
      } finally {
        setIsLoadingSlides(false);
      }
    };
    fetchSlides();
  }, [token]);

  // Sends DELETE request to server
  const confirmDelete = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.delete(`${baseUrl}/api/slides/${deleteModal.id}`, {
        headers: { token: token },
      });
      setSlides(slides.filter((slide) => slide._id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, title: "" });
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert("Failed to delete the slide.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-wrapper">
        <Header onLogout={onLogout} title="Francken TV Slides" />
        <div className="workspace-viewport-container">
          <main className="admin-main-stage">
            <div className="slides-table-container">
              <Table
                slides={slides}
                isLoading={isLoadingSlides}
                error={slidesError}
                onOpenDeleteModal={(id, title) =>
                  setDeleteModal({ isOpen: true, id, title })
                }
              />
            </div>
          </main>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: "" })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
