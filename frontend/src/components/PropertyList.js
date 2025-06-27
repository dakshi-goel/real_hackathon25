import React from 'react';
import PropertyCard from './PropertyCard';
import './PropertyList.css';

const PropertyList = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="property-list-loading">
        <div className="loader"></div>
        <p>Searching for properties...</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="property-list-empty">
        <h3>No properties found</h3>
        <p>Start a voice search to find your perfect property!</p>
      </div>
    );
  }

  return (
    <div className="property-list-container">
      <h2 className="property-list-title">
        Found {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
      </h2>
      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyList;