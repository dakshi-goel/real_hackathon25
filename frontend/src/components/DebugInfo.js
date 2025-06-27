import React from 'react';

const DebugInfo = () => {
  const envVars = {
    'VAPI Public Key': process.env.REACT_APP_VAPI_PUBLIC_KEY ? 
      `${process.env.REACT_APP_VAPI_PUBLIC_KEY.substring(0, 10)}...` : 'NOT SET',
    'VAPI Assistant ID': process.env.REACT_APP_VAPI_ASSISTANT_ID || 'NOT SET',
    'API URL': process.env.REACT_APP_API_URL || 'NOT SET',
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Debug Info</h4>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '5px' }}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
      <div style={{ marginTop: '10px', borderTop: '1px solid #444', paddingTop: '10px' }}>
        <strong>Instructions:</strong>
        <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Check if all values are set</li>
          <li>Restart app after changing .env</li>
          <li>Check browser console for errors</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugInfo;