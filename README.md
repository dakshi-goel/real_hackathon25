# AI Real Estate Marketplace with Voice Search

A voice-powered real estate marketplace that uses Vapi.ai for natural language property search with hybrid search capabilities.

## Features

- 🎤 **Voice-Powered Search**: Natural conversation with AI assistant
- 🔍 **Hybrid Search**: Combines keyword, semantic, and fuzzy matching
- 🏠 **100+ Properties**: Diverse property database across 10 US cities
- 📊 **Smart Scoring**: Properties ranked by match percentage (0-100%)
- 💬 **Real-time Updates**: See properties as the AI describes them
- 🎯 **Feature Grouping**: Understands related amenities (pool → swimming pool, spa)

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Vapi.ai account (free tier available)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
PORT=5000
VAPI_API_KEY=your_vapi_api_key_here
NODE_ENV=development
```

Start the backend server:

```bash
npm start
```

Backend will run on http://localhost:5000

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_VAPI_PUBLIC_KEY=your_vapi_public_key_here
REACT_APP_VAPI_ASSISTANT_ID=your_assistant_id_here
```

Start the frontend:

```bash
npm start
```

Frontend will run on http://localhost:3000

## Project Structure

```
hackathon-final/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceAssistant.js    # Voice UI component
│   │   │   ├── PropertyCard.js      # Property display cards
│   │   │   ├── PropertyList.js      # Property grid layout
│   │   │   └── SearchProgress.js    # Search status indicator
│   │   ├── services/
│   │   │   ├── vapiService.js       # Vapi.ai integration
│   │   │   └── api.js               # Backend API calls
│   │   └── App.js                   # Main application
│   └── .env                         # Frontend environment variables
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── propertyController.js # Property endpoints
│   │   │   └── vapiController.js    # Vapi webhook handler
│   │   ├── services/
│   │   │   └── propertyService.js   # Search logic & scoring
│   │   ├── data/
│   │   │   └── properties.js        # 100 property database
│   │   └── app.js                   # Express server setup
│   └── .env                         # Backend environment variables
└── README.md
```

## Getting Vapi.ai Credentials

1. Sign up at [Vapi.ai](https://vapi.ai)
2. Navigate to Settings → API Keys
3. Copy your Public Key for frontend
4. Copy your Private/Secret Key for backend
5. (Optional) Create an assistant in the dashboard and copy the Assistant ID

## How to Use

1. **Start a Voice Search**: Click the microphone button
2. **Natural Conversation**: Tell the AI what you're looking for
   - "I'm looking for a house in Austin"
   - "My budget is around 600 to 800 thousand"
   - "I need at least 3 bedrooms with a pool"
3. **See Results**: Properties appear with match scores as the AI speaks
4. **Refine Search**: Ask to adjust criteria or see more options

## Search Examples

### Family Home
- Location: Austin
- Budget: $500k-$800k
- Bedrooms: 4+
- Features: Pool, good schools, garage

### Urban Professional
- Location: New York
- Type: Condo
- Budget: Under $1M
- Features: Doorman, gym, city view

### Budget-Conscious
- Budget: Under $300k
- Bedrooms: 2+
- Features: Parking, yard

## Troubleshooting

### Voice Not Working

1. Check browser permissions for microphone
2. Verify Vapi public key is set correctly
3. Check browser console for errors
4. Ensure HTTPS in production (voice requires secure context)

### 401 Error from Vapi

1. Verify both public key (frontend) and API key (backend) are correct
2. Check that keys haven't expired
3. Ensure environment variables are loaded (restart servers after .env changes)

### Properties Not Loading

1. Check backend is running on port 5000
2. Verify frontend API URL points to backend
3. Check browser console for CORS errors
4. Ensure both servers are running

### Search Not Working

1. Check Vapi webhook URL in vapiService.js matches your backend
2. Verify searchProperties function is properly connected
3. Check backend logs for incoming webhook calls

## Environment Variables

### Frontend (.env)
- `REACT_APP_API_URL`: Backend server URL
- `REACT_APP_VAPI_PUBLIC_KEY`: Vapi public key for browser
- `REACT_APP_VAPI_ASSISTANT_ID`: (Optional) Pre-configured assistant ID

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `VAPI_API_KEY`: Vapi private/secret key
- `NODE_ENV`: development or production

## Development Tips

1. **Testing Voice**: Use headphones to avoid echo
2. **Debug Mode**: Check DebugInfo component for environment status
3. **Logs**: Monitor both frontend console and backend terminal
4. **Hot Reload**: Both servers support hot reloading

## API Endpoints

- `GET /api/properties` - Get all properties
- `POST /api/properties/search` - Search properties with criteria
- `GET /api/properties/:id` - Get property by ID
- `POST /api/vapi/webhook` - Vapi webhook endpoint

## Technologies Used

- **Frontend**: React, Vapi Web SDK, Axios, Lucide Icons
- **Backend**: Express.js, Node.js
- **Voice**: Vapi.ai for voice interactions
- **Search**: Hybrid search with match scoring
- **Database**: 100 in-memory properties (upgradeable to PostgreSQL)

## Production Deployment

1. **HTTPS Required**: Voice APIs require secure context
2. **Environment Variables**: Set in hosting platform
3. **CORS**: Configure for your domain
4. **Database**: Consider PostgreSQL with pgvector for scale

## Next Steps

- Add PostgreSQL with pgvector for production search
- Implement user authentication
- Add property images and virtual tours
- Integrate with real MLS data
- Add appointment scheduling

## License

MIT