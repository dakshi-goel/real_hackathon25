import React from 'react';
import { Home, Bed, Bath, Square, MapPin } from 'lucide-react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyIcon = (type) => {
    switch (type) {
      case 'house':
        return '🏠';
      case 'condo':
        return '🏢';
      case 'apartment':
      case 'studio':
        return '🏘️';
      case 'penthouse':
        return '🏙️';
      default:
        return '🏠';
    }
  };

  return (
    <div className="property-card">
      {property.matchScore && (
        <div className={`match-score-badge ${property.matchScore >= 80 ? 'excellent' : property.matchScore >= 60 ? 'good' : 'fair'}`}>
          {property.matchScore}% Match
        </div>
      )}
      
      <div className="property-header">
        <div className="property-type-icon">{getPropertyIcon(property.type)}</div>
        <div className="property-title-section">
          <h3 className="property-title">{property.title}</h3>
          <p className="property-address">
            <MapPin size={16} />
            {property.address}, {property.city}, {property.state}
          </p>
        </div>
      </div>

      <div className="property-price">{formatPrice(property.price)}</div>

      <div className="property-details">
        <div className="detail-item">
          <Bed size={20} />
          <span>{property.bedrooms || 'Studio'} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
        </div>
        <div className="detail-item">
          <Bath size={20} />
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
        </div>
        <div className="detail-item">
          <Square size={20} />
          <span>{property.squareFeet.toLocaleString()} sqft</span>
        </div>
      </div>

      <p className="property-description">{property.description}</p>

      {property.features && property.features.length > 0 && (
        <div className="property-features">
          {property.features.slice(0, 4).map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
          {property.features.length > 4 && (
            <span className="feature-tag more">+{property.features.length - 4} more</span>
          )}
        </div>
      )}

      <div className="property-actions">
        <button className="view-details-btn">
          View Details
        </button>
        <button className="schedule-btn">
          Schedule Viewing
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;