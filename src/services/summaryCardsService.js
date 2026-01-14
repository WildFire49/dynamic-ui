/**
 * Summary Cards Service
 * Handles API calls for dashboard summary cards generation, approval, and retrieval
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Get authorization headers from localStorage
 */
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Generate summary cards for a dashboard
 * Analyzes all widgets and generates 3-7 intelligent summary cards
 */
export const generateSummaryCards = async ({
  username,
  dashboardId,
  connectionId,
  userContext = {},
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/generate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          dashboardId,
          connectionId,
          userContext,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Insights feature coming soon! API not yet available.");
      }
      throw new Error(
        `Failed to generate summary cards: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    // Provide user-friendly error message
    if (error.message.includes("coming soon")) {
      throw error;
    }
    console.error("Error generating summary cards:", error);
    throw new Error("Insights feature coming soon! Please try again later.");
  }
};

/**
 * Approve selected summary cards
 * Human-in-the-loop approval with optional modifications
 */
export const approveSummaryCards = async ({
  username,
  dashboardId,
  approvalId,
  approvedCardIds,
  userModifications = {},
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/approve`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          approvalId,
          approvedCardIds,
          userModifications,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to approve summary cards: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error approving summary cards:", error);
    throw error;
  }
};

/**
 * Get approved summary cards for a dashboard
 * Returns empty array gracefully if API not available
 */
export const getSummaryCards = async ({
  username,
  dashboardId,
  connectionId,
  cardIds = [],
  regenerateSql = false,
  existingCards = [],
}) => {
  const headers = getAuthHeaders();
  let metadataCards = Array.isArray(existingCards)
    ? existingCards.filter(Boolean)
    : [];

  // Step 1: Fetch metadata if not already provided
  if (
    (!metadataCards || metadataCards.length === 0) &&
    dashboardId &&
    username
  ) {
    try {
      const metaResponse = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "GET",
          headers,
        }
      );

      if (metaResponse.ok) {
        const metaJson = await metaResponse.json();
        metadataCards =
          metaJson?.data?.summary_cards ||
          metaJson?.data?.data?.summary_cards ||
          metaJson?.data ||
          [];
      } else if (metaResponse.status !== 404) {
        console.warn(
          `Summary cards metadata API returned ${metaResponse.status}`
        );
      }
    } catch (error) {
      console.warn("Summary cards metadata API not available:", error.message);
    }
  }

  const idsToFetch =
    Array.isArray(cardIds) && cardIds.length > 0
      ? cardIds
      : (metadataCards || []).map((card) => card.id).filter(Boolean);

  let combinedCards = metadataCards;

  // Step 2: Fetch computed values if connection details available
  if (connectionId && username) {
    try {
      const payload = {
        username,
        connectionId,
        regenerateSql,
      };

      if (dashboardId) {
        payload.dashboardId = dashboardId;
      }

      if (idsToFetch.length > 0) {
        payload.cardIds = idsToFetch;
      }

      const dataResponse = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/summary-cards/data`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (dataResponse.ok) {
        const dataJson = await dataResponse.json();
        const results =
          dataJson?.data?.data?.results ||
          dataJson?.data?.results ||
          dataJson?.results ||
          [];

        const refreshedCards = results
          .filter((item) => item.success && item.data)
          .map((item) => {
            // Extract the card data - prioritize cardData if it exists
            const cardPayload =
              item.data?.cardData && Object.keys(item.data.cardData).length > 0
                ? item.data.cardData
                : item.data;

            // Merge all data sources
            return {
              ...cardPayload,
              _pipelineData: item.data.pipelineData || item.pipelineData || cardPayload.pipelineData,
              _dataGrid: item.data.dataGrid || item.dataGrid || cardPayload.dataGrid,
              query_results: cardPayload.query_results || item.data.query_results,
              comparison_data: cardPayload.comparison_data || item.data.comparison_data,
              top_entries: cardPayload.top_entries || item.data.top_entries,
              bottom_entries: cardPayload.bottom_entries || item.data.bottom_entries,
              executionTimeMs: item.executionTimeMs,
              rowCount: item.rowCount,
            };
          })
          .filter((card) => card?.id);

        if (refreshedCards.length > 0) {
          const refreshedMap = new Map(
            refreshedCards.map((card) => [card.id, card])
          );

          if (metadataCards && metadataCards.length > 0) {
            const metadataIds = new Set(metadataCards.map((card) => card.id));
            const mergedCards = metadataCards.map((card) =>
              refreshedMap.has(card.id)
                ? { ...card, ...refreshedMap.get(card.id) }
                : card
            );
            const newCards = refreshedCards.filter(
              (card) => !metadataIds.has(card.id)
            );
            combinedCards = [...mergedCards, ...newCards];
          } else {
            combinedCards = refreshedCards;
          }
        }
      } else if (dataResponse.status !== 404) {
        console.warn(`Summary card data API returned ${dataResponse.status}`);
      }
    } catch (error) {
      console.warn("Summary card data API not available:", error.message);
    }
  }

  return { data: { summary_cards: combinedCards || [] } };
};

/**
 * Delete a summary card (soft delete)
 */
export const deleteSummaryCard = async ({ username, dashboardId, cardId }) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/${cardId}?username=${encodeURIComponent(
        username
      )}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete summary card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting summary card:", error);
    throw error;
  }
};

/**
 * Edit an approved summary card (PATCH - updates in database)
 */
export const editApprovedCard = async ({
  username,
  dashboardId,
  cardId,
  updates,
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/${cardId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          ...updates,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit summary card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing summary card:", error);
    throw error;
  }
};

/**
 * Edit a pending card before approval (PUT - updates in memory)
 */
export const editPendingCard = async ({
  dashboardId,
  approvalId,
  cardId,
  updates,
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/edit`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          approvalId,
          cardId,
          ...updates,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to edit pending card: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error editing pending card:", error);
    throw error;
  }
};

/**
 * Urgency priority mapping for sorting
 */
export const URGENCY_PRIORITY = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/**
 * Sort cards by urgency and display order
 */
export const sortCardsByPriority = (cards) => {
  return [...cards].sort((a, b) => {
    const urgencyDiff =
      (URGENCY_PRIORITY[a.urgency] || 4) - (URGENCY_PRIORITY[b.urgency] || 4);
    if (urgencyDiff !== 0) return urgencyDiff;
    return (a.display_order || 0) - (b.display_order || 0);
  });
};

const summaryCardsService = {
  generateSummaryCards,
  approveSummaryCards,
  getSummaryCards,
  deleteSummaryCard,
  editApprovedCard,
  editPendingCard,
  sortCardsByPriority,
  URGENCY_PRIORITY,
};

export default summaryCardsService;
