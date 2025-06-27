import React, { useState, useEffect } from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import PropertyList from './components/PropertyList';
import SearchProgress from './components/SearchProgress';
// import DebugInfo from './components/DebugInfo';
import { propertyApi } from './services/api';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);

  // Load initial properties
  useEffect(() => {
    loadAllProperties();
  }, []);

  const loadAllProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyApi.getAllProperties();
      setProperties(response.data);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceUpdate = (update) => {
    console.log('Voice update received:', update);
    
    if (update.type === 'search-started') {
      setIsSearching(true);
      setSearchCriteria(null);
    } else if (update.type === 'search-results' && update.data) {
      setIsSearching(false);
      if (update.data.properties) {
        setProperties(update.data.properties);
        // Extract search criteria from the first property search
        if (update.data.properties.length > 0) {
          // This is a simplified extraction - in a real app, 
          // you'd pass the actual criteria from the backend
          setSearchCriteria({
            location: update.data.properties[0].city,
            count: update.data.count
          });
        }
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Dream Homes Reality</h1>
          <p className="app-subtitle">Find your dream property with voice search</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <VoiceAssistant onPropertiesUpdate={handleVoiceUpdate} />
          
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={loadAllProperties}>Retry</button>
            </div>
          )}

          {(isSearching || searchCriteria) && (
            <SearchProgress 
              isSearching={isSearching}
              foundCount={searchCriteria?.count || 0}
              criteria={searchCriteria}
            />
          )}

          <PropertyList properties={properties} loading={loading} />
        </div>
      </main>

      <footer className="app-footer">
        <p>REAL CLAUDE HACKATHON 2025</p>
      </footer>
      
      {/* Debug info - remove in production */}
      {/* <DebugInfo /> */}
    </div>
  );
}

export default App;