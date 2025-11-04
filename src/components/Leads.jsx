"use client";

import React from "react";
import DynamicLeadsRenderer from "./DynamicLeadsRenderer";
import leadsConfig from "./leadsConfig.json";

const Leads = () => {
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
      config={leadsConfig}
      onCardClick={handleCardClick}
      onSave={handleSave}
    />
  );
};

export default Leads;
