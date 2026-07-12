// src/components/SlideTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function TableState({ children }) {
  return (
    <div className="empty-state">
      <p>{children}</p>
    </div>
  );
}

function LoadingTableState() {
  return (
    <TableState>
      Loading slides
      <span className="dot-pulse" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </TableState>
  );
}

export default function Table({ slides, isLoading, error, onOpenDeleteModal }) {
  // Needed for redirect to edit page
  const navigate = useNavigate();

  const openSlide = (slideId) => {
    navigate(`/admin/slides/${slideId}`);
  };

  const handleRowKeyDown = (e, slideId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSlide(slideId);
    }
  };

  const handleDeleteClick = (e, slide) => {
    e.stopPropagation();
    onOpenDeleteModal(slide._id, slide.title);
  };

  if (isLoading) {
    return <LoadingTableState />;
  }

  if (error) {
    return <TableState>{error}</TableState>;
  }

  if (slides.length === 0) {
    return (
      <TableState>No slides yet. Create your first slide to get started!</TableState>
    );
  }

  // Table
  return (
    <table className="slides-data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Description</th>
          <th>Type</th>
          <th>Frequency</th>
          <th>Duration</th>
          <th>Created</th>
          <th>Last updated</th>
          <th className="text-center">Delete</th>
        </tr>
      </thead>
      <tbody>
        {slides.map((slide) => (
          <tr
            key={slide._id}
            className="clickable-table-row"
            tabIndex="0"
            role="button"
            onClick={() => openSlide(slide._id)}
            onKeyDown={(e) => handleRowKeyDown(e, slide._id)}
          >
            <td className="cell-id">#{slide.displayId || "N/A"}</td>
            <td className="cell-name">{slide.title}</td>
            <td className="cell-description">{slide.description}</td>
            <td>
              <span className="type-badge">{slide.type}</span>
            </td>
            <td>
              <span className="type-badge">{slide.frequency}</span>
            </td>
            <td className="cell-duration">{slide.duration}s</td>
            <td className="cell-date">
              {new Date(slide.createdAt).toLocaleString()}
            </td>
            <td className="cell-date">
              {new Date(slide.updatedAt).toLocaleString()}
            </td>
            <td className="cell-actions text-center">
              <button
                className="table-action-btn delete-btn"
                onClick={(e) => handleDeleteClick(e, slide)}
                aria-label={`Delete ${slide.title}`}
              >
                <img src="/delete.svg" alt="" className="delete-btn-icon" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
