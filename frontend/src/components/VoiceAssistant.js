import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import vapiService from '../services/vapiService';
import './VoiceAssistant.css';

const VoiceAssistant = ({ onPropertiesUpdate }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callStatus, setCallStatus] = useState('Ready to assist');

  useEffect(() => {
    // Initialize Vapi service
    vapiService.initialize();

    // Set up event listeners
    const handleCallStart = () => {
      setCallStatus('Connected - How can I help you find your dream home?');
      setIsCallActive(true);
    };

    const handleCallEnd = () => {
      setCallStatus('Call ended - Click to start a new conversation');
      setIsCallActive(false);
    };

    const handleError = (error) => {
      setError(error.message || 'An error occurred');
      setIsCallActive(false);
      setIsLoading(false);
    };

    if (vapiService.vapi) {
      vapiService.vapi.on('call-start', handleCallStart);
      vapiService.vapi.on('call-end', handleCallEnd);
      vapiService.vapi.on('error', handleError);
    }

    return () => {
      // Cleanup listeners
      if (vapiService.vapi) {
        vapiService.vapi.off('call-start', handleCallStart);
        vapiService.vapi.off('call-end', handleCallEnd);
        vapiService.vapi.off('error', handleError);
      }
    };
  }, []);

  const handleToggleCall = async () => {
    setError(null);

    if (isCallActive) {
      setIsLoading(true);
      try {
        await vapiService.endCall();
        setIsCallActive(false);
        setCallStatus('Call ended - Click to start a new conversation');
      } catch (err) {
        setError('Failed to end call');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      setCallStatus('Connecting...');
      try {
        await vapiService.startCall((data) => {
          if (data.properties) {
            onPropertiesUpdate(data.properties);
          }
        });
        // isCallActive will be set by the event listener
      } catch (err) {
        setError('Failed to start call. Please check your configuration.');
        setCallStatus('Ready to assist');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="voice-assistant">
      <div className="assistant-container">
        <h2 className="assistant-title">AI Real Estate Assistant</h2>
        
        <div className="status-display">
          <div className={`status-indicator ${isCallActive ? 'active' : ''}`} />
          <p className="status-text">{callStatus}</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <button
          className={`call-button ${isCallActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleToggleCall}
          disabled={isLoading}
        >
          <div className="button-content">
            {isCallActive ? (
              <>
                <PhoneOff size={24} />
                <span>End Call</span>
              </>
            ) : (
              <>
                <Phone size={24} />
                <span>Start Voice Search</span>
              </>
            )}
          </div>
          {isCallActive && (
            <div className="pulse-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </button>

        <div className="instructions">
          <h3>How to use:</h3>
          <ul>
            <li>Click "Start Voice Search" to begin</li>
            <li>Tell me about your ideal property</li>
            <li>I'll ask about your budget, location, and preferences</li>
            <li>View matching properties below as we talk</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;