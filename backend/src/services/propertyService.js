const properties = require('../data/properties');

class PropertyService {
  constructor() {
    // Pre-compute search indices for better performance
    this.initializeSearchIndices();
  }

  initializeSearchIndices() {
    // Create inverted index for features
    this.featureIndex = {};
    properties.forEach(property => {
      property.features.forEach(feature => {
        const normalizedFeature = feature.toLowerCase();
        if (!this.featureIndex[normalizedFeature]) {
          this.featureIndex[normalizedFeature] = [];
        }
        this.featureIndex[normalizedFeature].push(property.id);
      });
    });

    // Create location index
    this.locationIndex = {};
    properties.forEach(property => {
      const cityKey = property.city.toLowerCase();
      if (!this.locationIndex[cityKey]) {
        this.locationIndex[cityKey] = [];
      }
      this.locationIndex[cityKey].push(property.id);
    });
  }

  // Calculate similarity score between property and search criteria
  calculateMatchScore(property, criteria) {
    let score = 0;
    let maxScore = 0;

    // Price match (30% weight)
    if (criteria.minPrice || criteria.maxPrice) {
      maxScore += 30;
      const minPrice = criteria.minPrice || 0;
      const maxPrice = criteria.maxPrice || Infinity;
      
      if (property.price >= minPrice && property.price <= maxPrice) {
        // Perfect match within range
        score += 30;
      } else {
        // Partial score based on how close it is
        const distance = property.price < minPrice ? 
          (minPrice - property.price) / minPrice : 
          (property.price - maxPrice) / maxPrice;
        score += Math.max(0, 30 - (distance * 30));
      }
    }

    // Bedroom match (20% weight)
    if (criteria.bedrooms !== undefined) {
      maxScore += 20;
      if (property.bedrooms >= criteria.bedrooms) {
        score += 20;
      } else {
        // Partial score if close
        const diff = criteria.bedrooms - property.bedrooms;
        score += Math.max(0, 20 - (diff * 10));
      }
    }

    // Location match (25% weight)
    if (criteria.location || criteria.city) {
      maxScore += 25;
      const searchLocation = (criteria.location || criteria.city).toLowerCase();
      const propertyLocation = `${property.city} ${property.state} ${property.address}`.toLowerCase();
      
      if (property.city.toLowerCase() === searchLocation) {
        score += 25; // Exact city match
      } else if (propertyLocation.includes(searchLocation)) {
        score += 15; // Partial match
      }
    }

    // Property type match (15% weight)
    if (criteria.propertyType || criteria.type) {
      maxScore += 15;
      const searchType = (criteria.propertyType || criteria.type).toLowerCase();
      if (property.type === searchType) {
        score += 15;
      }
    }

    // Features match (10% weight)
    if (criteria.features && criteria.features.length > 0) {
      maxScore += 10;
      const matchedFeatures = criteria.features.filter(feature => 
        property.features.some(pf => pf.toLowerCase().includes(feature.toLowerCase()))
      );
      score += (matchedFeatures.length / criteria.features.length) * 10;
    }

    // Normalize score to 0-100
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
  }

  // Fuzzy string matching
  fuzzyMatch(str1, str2) {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    
    // Exact match
    if (str1 === str2) return 1;
    
    // Contains match
    if (str1.includes(str2) || str2.includes(str1)) return 0.8;
    
    // Levenshtein distance-based similarity
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  // Semantic feature matching
  getRelatedFeatures(feature) {
    const featureGroups = {
      'pool': ['swimming pool', 'spa', 'hot tub', 'jacuzzi'],
      'garage': ['parking', 'carport', 'covered parking'],
      'garden': ['yard', 'backyard', 'lawn', 'landscaping'],
      'view': ['ocean view', 'mountain view', 'city view', 'lake view', 'panoramic view'],
      'modern': ['updated', 'renovated', 'new construction', 'contemporary'],
      'luxury': ['high-end', 'premium', 'upscale', 'exclusive'],
      'school': ['good schools', 'school district', 'education'],
      'family': ['family room', 'family-friendly', 'playground', 'safe neighborhood']
    };

    const normalizedFeature = feature.toLowerCase();
    for (const [key, values] of Object.entries(featureGroups)) {
      if (normalizedFeature.includes(key) || values.some(v => normalizedFeature.includes(v))) {
        return [key, ...values];
      }
    }
    return [normalizedFeature];
  }

  searchProperties(criteria) {
    console.log('Search criteria:', criteria);
    
    // Start with all properties
    let results = [...properties];
    
    // Apply hard filters first
    if (criteria.minPrice) {
      results = results.filter(p => p.price >= criteria.minPrice);
    }
    if (criteria.maxPrice) {
      results = results.filter(p => p.price <= criteria.maxPrice);
    }
    
    // Calculate match scores for remaining properties
    const scoredResults = results.map(property => ({
      ...property,
      matchScore: this.calculateMatchScore(property, criteria)
    }));
    
    // Sort by match score (highest first)
    scoredResults.sort((a, b) => b.matchScore - a.matchScore);
    
    // Apply fuzzy matching for features if needed
    if (criteria.features && criteria.features.length > 0) {
      scoredResults.forEach(property => {
        let featureBonus = 0;
        criteria.features.forEach(searchFeature => {
          const relatedFeatures = this.getRelatedFeatures(searchFeature);
          const hasRelatedFeature = property.features.some(pf => 
            relatedFeatures.some(rf => this.fuzzyMatch(pf, rf) > 0.7)
          );
          if (hasRelatedFeature) {
            featureBonus += 5;
          }
        });
        property.matchScore = Math.min(100, property.matchScore + featureBonus);
      });
      
      // Re-sort after feature bonus
      scoredResults.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Filter out low matches
    const relevantResults = scoredResults.filter(p => p.matchScore > 30);
    
    // Return top results
    return relevantResults.slice(0, 10);
  }

  getPropertyById(id) {
    return properties.find(p => p.id === parseInt(id));
  }

  getAllProperties() {
    return properties;
  }

  formatPropertyForVoice(property) {
    const priceStr = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(property.price);

    const bedroomStr = property.bedrooms === 0 ? 'studio' : 
                      property.bedrooms === 1 ? '1 bedroom' : 
                      `${property.bedrooms} bedrooms`;

    return `${property.title} at ${property.address} in ${property.city}. ` +
           `It's a ${bedroomStr} ${property.type} priced at ${priceStr}, ` +
           `with ${property.squareFeet} square feet. ` +
           `Features include ${property.features.join(', ')}.`;
  }
}

module.exports = new PropertyService();