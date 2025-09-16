import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useReviewStore = create(
  persist(
    (set, get) => ({
      // Store review data by table name and record key
      reviews: {},
      
      // Add or update a review
      addReview: (tableName, recordKey, reviewData) => {
        // Create a unique compound key to avoid duplicates for same key_ref with different mismatch types
        const uniqueKey = typeof recordKey === 'object' ? 
          `${recordKey.key_ref}_${recordKey.mismatch_type}` : recordKey;
        
        set((state) => ({
          reviews: {
            ...state.reviews,
            [tableName]: {
              ...state.reviews[tableName],
              [uniqueKey]: {
                ...reviewData,
                timestamp: new Date().toISOString(),
                id: `${tableName}_${uniqueKey}_${Date.now()}`
              }
            }
          }
        }));
      },
      
      // Get review for specific record
      getReview: (tableName, recordKey) => {
        const state = get();
        // Create a unique compound key to match the one used in addReview
        const uniqueKey = typeof recordKey === 'object' ? 
          `${recordKey.key_ref}_${recordKey.mismatch_type}` : recordKey;
        return state.reviews[tableName]?.[uniqueKey] || null;
      },
      
      // Get all reviews for a table
      getTableReviews: (tableName) => {
        const state = get();
        return state.reviews[tableName] || {};
      },
      
      // Remove a review
      removeReview: (tableName, recordKey) => {
        const uniqueKey = typeof recordKey === 'object' ? 
          `${recordKey.key_ref}_${recordKey.mismatch_type}` : recordKey;
          
        set((state) => {
          const newTableReviews = { ...state.reviews[tableName] };
          delete newTableReviews[uniqueKey];
          
          return {
            reviews: {
              ...state.reviews,
              [tableName]: newTableReviews
            }
          };
        });
      },
      
      // Clear all reviews for a table
      clearTableReviews: (tableName) => {
        set((state) => {
          const newReviews = { ...state.reviews };
          delete newReviews[tableName];
          return { reviews: newReviews };
        });
      },
      
      // Export reviews as CSV data
      exportTableReviews: (tableName, tableData) => {
        const state = get();
        const reviews = state.reviews[tableName] || {};
        
        return tableData.map(row => {
          const uniqueKey = `${row.key_ref}_${row.mismatch_type}`;
          const review = reviews[uniqueKey] || {};
          return {
            ...row,
            review_status: review.status || 'Pending Review',
            reviewer_comment: review.comment || '',
            reviewed_by: review.reviewedBy || '',
            review_date: review.timestamp ? new Date(review.timestamp).toLocaleDateString() : '',
            marked_as_not_mismatch: review.notMismatch ? 'Yes' : 'No'
          };
        });
      }
    }),
    {
      name: 'review-storage',
      version: 1
    }
  )
);

export default useReviewStore;
