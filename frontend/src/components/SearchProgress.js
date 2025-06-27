import React from 'react';
import { Search, CheckCircle, Loader2 } from 'lucide-react';
import './SearchProgress.css';

const SearchProgress = ({ isSearching, foundCount, criteria }) => {
  if (!isSearching && foundCount === 0) return null;

  return (
    <div className="search-progress">
      <div className="search-header">
        {isSearching ? (
          <>
            <Loader2 className="spinner" size={24} />
            <h3>Searching for your perfect property...</h3>
          </>
        ) : (
          <>
            <CheckCircle className="success-icon" size={24} />
            <h3>Found {foundCount} matching properties!</h3>
          </>
        )}
      </div>
      
      {criteria && (
        <div className="search-criteria">
          <h4>Your search criteria:</h4>
          <div className="criteria-tags">
            {criteria.location && (
              <span className="criteria-tag">📍 {criteria.location}</span>
            )}
            {criteria.bedrooms && (
              <span className="criteria-tag">🛏️ {criteria.bedrooms}+ bedrooms</span>
            )}
            {criteria.minPrice && criteria.maxPrice && (
              <span className="criteria-tag">
                💰 ${(criteria.minPrice / 1000).toFixed(0)}k - ${(criteria.maxPrice / 1000).toFixed(0)}k
              </span>
            )}
            {criteria.features && criteria.features.map((feature, idx) => (
              <span key={idx} className="criteria-tag">✨ {feature}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="search-animation">
        <div className="pulse-rings">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SearchProgress;