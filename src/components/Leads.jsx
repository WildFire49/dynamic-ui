"use client";

import React from "react";
import DynamicLeadsRenderer from "./DynamicLeadsRenderer";
import { HDFCLeadManagementConfig } from "./leadsConfig";

const Leads = ({ selectedFilter, onFilterChange }) => {
  // Handle card click
  const handleCardClick = (item) => {
    console.log("Card clicked:", item);
  };

  // Handle save
  const handleSave = (updatedItem) => {
    console.log("Saving item:", updatedItem);
    // Add your save logic here (e.g., API call)
  };

  return (
    <DynamicLeadsRenderer
      config={HDFCLeadManagementConfig}
      onCardClick={handleCardClick}
      onSave={handleSave}
      selectedFilter={selectedFilter}
      onFilterChange={onFilterChange}
    />
  );
};

export default Leads;
