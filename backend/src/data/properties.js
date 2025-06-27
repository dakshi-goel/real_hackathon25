// Comprehensive property database with 100 diverse properties
const properties = [];

// Helper function to generate property title
const generateTitle = (type, features) => {
  const adjectives = ['Modern', 'Charming', 'Stunning', 'Beautiful', 'Luxurious', 'Cozy', 'Spacious', 'Updated'];
  const types = {
    house: 'Home',
    condo: 'Condo',
    townhouse: 'Townhouse',
    apartment: 'Apartment',
    penthouse: 'Penthouse'
  };
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${types[type] || 'Property'}`;
};

// Generate 100 diverse properties
const cities = [
  { city: "San Francisco", state: "CA", avgPrice: 1200000 },
  { city: "Los Angeles", state: "CA", avgPrice: 900000 },
  { city: "New York", state: "NY", avgPrice: 1500000 },
  { city: "Austin", state: "TX", avgPrice: 600000 },
  { city: "Seattle", state: "WA", avgPrice: 800000 },
  { city: "Miami", state: "FL", avgPrice: 700000 },
  { city: "Denver", state: "CO", avgPrice: 650000 },
  { city: "Portland", state: "OR", avgPrice: 550000 },
  { city: "Chicago", state: "IL", avgPrice: 450000 },
  { city: "Boston", state: "MA", avgPrice: 750000 }
];

const propertyTypes = ['house', 'condo', 'townhouse', 'apartment', 'penthouse'];

const allFeatures = [
  // Luxury features
  ['pool', 'spa', 'wine cellar', 'home theater', 'smart home', 'private elevator'],
  // Family features
  ['garage', 'backyard', 'garden', 'playground', 'good schools', 'family room'],
  // Urban features
  ['doorman', 'concierge', 'gym', 'rooftop terrace', 'city view', 'walkable'],
  // Nature features
  ['ocean view', 'mountain view', 'lake access', 'hiking trails', 'private beach'],
  // Basic amenities
  ['parking', 'laundry', 'storage', 'balcony', 'patio', 'deck'],
  // Modern features
  ['solar panels', 'ev charging', 'energy efficient', 'new construction', 'renovated'],
  // Community features
  ['gated community', 'hoa', 'community pool', 'tennis court', 'golf course access']
];

// Generate properties
for (let i = 1; i <= 100; i++) {
  const cityInfo = cities[Math.floor(Math.random() * cities.length)];
  const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  
  // Price variation based on city average and property type
  let priceMultiplier = 1;
  if (type === 'penthouse') priceMultiplier = 2.5;
  else if (type === 'house') priceMultiplier = 1.3;
  else if (type === 'condo') priceMultiplier = 0.9;
  else if (type === 'townhouse') priceMultiplier = 1.1;
  else if (type === 'apartment') priceMultiplier = 0.7;
  
  const basePrice = cityInfo.avgPrice * priceMultiplier;
  const price = Math.floor(basePrice * (0.5 + Math.random()));
  
  // Bedrooms based on type
  let bedrooms = 0;
  if (type === 'house') bedrooms = Math.floor(Math.random() * 3) + 3;
  else if (type === 'condo' || type === 'townhouse') bedrooms = Math.floor(Math.random() * 3) + 1;
  else if (type === 'apartment') bedrooms = Math.floor(Math.random() * 2) + 1;
  else if (type === 'penthouse') bedrooms = Math.floor(Math.random() * 2) + 3;
  
  const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75));
  const squareFeet = Math.floor(600 + (bedrooms * 400) + (Math.random() * 1000));
  
  // Select features based on price range
  let selectedFeatures = [];
  if (price > 1500000) {
    // Luxury properties
    selectedFeatures = [
      ...allFeatures[0].slice(0, Math.floor(Math.random() * 3) + 2),
      ...allFeatures[5].slice(0, Math.floor(Math.random() * 2) + 1)
    ];
  } else if (price > 800000) {
    // Mid-high range
    selectedFeatures = [
      ...allFeatures[1].slice(0, Math.floor(Math.random() * 3) + 1),
      ...allFeatures[4].slice(0, Math.floor(Math.random() * 2) + 1)
    ];
  } else {
    // Affordable range
    selectedFeatures = allFeatures[4].slice(0, Math.floor(Math.random() * 3) + 2);
  }
  
  // Add location-specific features
  if (cityInfo.city === "Miami" || cityInfo.city === "Los Angeles") {
    if (Math.random() > 0.5) selectedFeatures.push("pool");
    if (Math.random() > 0.7) selectedFeatures.push("ocean view");
  }
  if (cityInfo.city === "Denver" || cityInfo.city === "Seattle") {
    if (Math.random() > 0.6) selectedFeatures.push("mountain view");
  }
  if (cityInfo.city === "New York" || cityInfo.city === "Chicago") {
    if (Math.random() > 0.5) selectedFeatures.push("city view");
    if (Math.random() > 0.7) selectedFeatures.push("doorman");
  }
  
  const streets = ['Main St', 'Oak Ave', 'Elm St', 'Park Blvd', 'Beach Rd', 'Mountain View Dr', 
                   'Sunset Blvd', 'Lake Shore Dr', 'Broadway', 'Fifth Ave'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  
  properties.push({
    id: i,
    title: generateTitle(type, selectedFeatures),
    address: `${Math.floor(Math.random() * 9999) + 1} ${street}`,
    city: cityInfo.city,
    state: cityInfo.state,
    zipCode: Math.floor(Math.random() * 90000) + 10000,
    price: price,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    squareFeet: squareFeet,
    type: type,
    features: [...new Set(selectedFeatures)], // Remove duplicates
    description: `${generateTitle(type, selectedFeatures)} in ${cityInfo.city}. This ${type} offers ${bedrooms} bedrooms and ${bathrooms} bathrooms with ${squareFeet} square feet of living space. ${selectedFeatures.length > 0 ? 'Features include ' + selectedFeatures.slice(0, 3).join(', ') + '.' : ''} Perfect for ${bedrooms <= 2 ? 'singles or couples' : 'families'}.`,
    yearBuilt: 1980 + Math.floor(Math.random() * 44),
    image: `https://source.unsplash.com/800x600/?${type},real-estate,home`
  });
}

module.exports = properties;