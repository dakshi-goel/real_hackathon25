import Vapi from '@vapi-ai/web';

class VapiService {
  constructor() {
    this.vapi = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;

    const publicKey = process.env.REACT_APP_VAPI_PUBLIC_KEY;
    console.log('Initializing Vapi with public key:', publicKey ? `${publicKey.substring(0, 10)}...` : 'NOT SET');
    console.log('REACT_APP_VAPI_PUBLIC_KEY:', process.env.REACT_APP_VAPI_PUBLIC_KEY);
    if (!publicKey) {
      console.error('REACT_APP_VAPI_PUBLIC_KEY is not set in environment variables');
      throw new Error('Vapi public key is missing');
    }

    this.vapi = new Vapi(publicKey);
    this.isInitialized = true;

    // Set up event listeners
    this.vapi.on('call-start', () => {
      console.log('Call started');
    });

    this.vapi.on('call-end', () => {
      console.log('Call ended');
    });

    this.vapi.on('speech-start', () => {
      console.log('User started speaking');
    });

    this.vapi.on('speech-end', () => {
      console.log('User stopped speaking');
    });

    this.vapi.on('message', (message) => {
      console.log('Message received:', message);
    });

    this.vapi.on('error', (error) => {
      console.error('Vapi error:', error);
    });
  }

  async startCall(onUpdate) {
    if (!this.isInitialized) {
      this.initialize();
    }

    try {
      // Option 1: If you have created an assistant in Vapi dashboard
      if (process.env.REACT_APP_VAPI_ASSISTANT_ID) {
        console.log('Starting call with assistant ID:', process.env.REACT_APP_VAPI_ASSISTANT_ID);
        await this.vapi.start(process.env.REACT_APP_VAPI_ASSISTANT_ID);
      } else {
        // Option 2: Create assistant on the fly
        console.log('Starting call with inline configuration');
        const assistantOptions = {
          name: 'Real Estate Assistant',
          model: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a friendly and professional real estate assistant helping users find their perfect property. 
                Your goal is to understand their needs and preferences to search for suitable properties.
                
                Start by greeting them warmly and asking what kind of property they're looking for.
                Then gather information about:
                - Budget (price range)
                - Location preferences
                - Number of bedrooms
                - Property type (house, condo, apartment, etc.)
                - Any specific features they want like pool, garden, terrace, etc.
                
                Be conversational and helpful. When you have enough information, search for properties and present the results clearly.
                Keep responses concise and natural for voice interaction.`
              }
            ],
            functions: [
              {
                name: 'searchProperties',
                description: 'Search for properties based on criteria',
                parameters: {
                  type: 'object',
                  properties: {
                    minPrice: { type: 'number', description: 'Minimum price' },
                    maxPrice: { type: 'number', description: 'Maximum price' },
                    bedrooms: { type: 'number', description: 'Minimum number of bedrooms' },
                    location: { type: 'string', description: 'City or area' },
                    propertyType: { type: 'string', description: 'Type of property' },
                    features: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Desired features'
                    }
                  }
                }
              },
              {
                name: 'getPropertyDetails',
                description: 'Get details about a specific property',
                parameters: {
                  type: 'object',
                  properties: {
                    propertyId: { type: 'number', description: 'Property ID' }
                  },
                  required: ['propertyId']
                }
              }
            ]
          },
          voice: {
            provider: 'playht',
            voiceId: 'jennifer'
          },
          serverUrl: `${process.env.REACT_APP_API_URL}/api/vapi/webhook`
        };

        await this.vapi.start(assistantOptions);
      }

      // Set up message handler for UI updates
      this.vapi.on('message', (message) => {
        console.log('Vapi message:', message);
        if (onUpdate) {
          if (message.type === 'function-call' && message.functionCall?.result?.data) {
            onUpdate({
              type: 'search-results',
              data: message.functionCall.result.data
            });
          } else if (message.type === 'transcript' && message.role === 'assistant') {
            // Track assistant messages for search progress
            const text = message.transcript.toLowerCase();
            if (text.includes('searching') || text.includes('looking for')) {
              onUpdate({
                type: 'search-started',
                data: { isSearching: true }
              });
            }
          }
        }
      });

    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  async endCall() {
    if (this.vapi) {
      await this.vapi.stop();
    }
  }

  isCallActive() {
    return this.vapi?.isCallActive || false;
  }
}

export default new VapiService();