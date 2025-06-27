# AI Real Estate Marketplace - Phase 1 Architecture (Simplified)

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Detailed User Flows](#detailed-user-flows)
3. [Technology Stack](#technology-stack)
4. [Service Architecture](#service-architecture)
5. [Data Models](#data-models)
6. [API Design](#api-design)
7. [Deployment Strategy](#deployment-strategy)
8. [Implementation Roadmap](#implementation-roadmap)

## System Architecture Overview

### Simplified Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│         • Web Interface  • Voice UI  • Admin Panel      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                 Backend API (Node.js)                   │
│              Single Express.js Server                    │
│  • REST API  • WebSocket  • Authentication  • Sessions  │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
│  PostgreSQL  │    │    Redis    │   │ Local Files │
│ • All Data   │    │ • Cache     │   │ • Images    │
│ • Search     │    │ • Sessions  │   │ • Uploads   │
└──────────────┘    └─────────────┘   └─────────────┘
```

### Component Overview
```
┌──────────────────────────────────────────────────────┐
│                    Frontend                           │
├───────────────┬────────────────┬────────────────────┤
│  Public Site  │  Voice Chat    │   Admin Panel      │
│  • Search     │  • Vapi.ai     │   • Properties     │
│  • Results    │  • WebRTC      │   • Users          │
│  • Details    │  • Audio       │   • Analytics      │
└───────────────┴────────────────┴────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│                   Backend API                        │
├─────────────────────────────────────────────────────┤
│  /api/auth     - User authentication                │
│  /api/users    - User management                    │
│  /api/search   - Property search                    │
│  /api/voice    - Voice session management           │
│  /api/properties - Property CRUD                    │
│  /api/recommendations - ML recommendations          │
└─────────────────────────────────────────────────────┘

## Detailed User Flows

### 1. New User Onboarding Flow

```mermaid
flowchart LR
    A[User Opens App] --> B[Landing Page]
    B --> C{Has Account?}
    C -->|No| D[Sign Up Form]
    C -->|Yes| E[Login Form]
    D --> F[Email/Phone Verification]
    E --> G[Dashboard]
    F --> H[Profile Setup]
    H --> I[Voice Permission Request]
    I --> J[Quick Tutorial]
    J --> G
    G --> K[Start Conversation Button]
```

### 2. Voice Conversation Flow

#### Initial Connection
```
1. User clicks "Talk to AI Agent" button
2. WebRTC connection initiated
3. Voice permissions checked
4. Vapi.ai session created
5. AI agent greets user
```

#### Conversation State Machine
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GREETING  │────▶│  GATHERING  │────▶│  SEARCHING  │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ CLARIFYING  │     │ PRESENTING  │
                    └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  BOOKING    │
                                        └─────────────┘
```

#### Detailed Conversation Flow
```
User: "I'm looking for a house"
  ↓
AI: "I'd be happy to help! What's your budget range?"
  ↓
User: "Around 500k to 700k"
  ↓
AI: "Great! Which areas are you considering?"
  ↓
User: "Somewhere in North Austin with good schools"
  ↓
AI: "How many bedrooms do you need?"
  ↓
User: "At least 3, preferably 4"
  ↓
AI: "Any must-have features like a pool or large yard?"
  ↓
User: "Yes, need a backyard for kids and a garage"
  ↓
AI: "I found 5 properties that match your needs. The top match is..."
  [Shows property cards on screen while describing]
```

### 3. Property Search Flow
```
Voice Input: "I need a 3 bedroom house under 500k"
     ↓
Parse Intent: {bedrooms: 3, type: "house", maxPrice: 500000}
     ↓
Hybrid Search → Keyword + Vector + Fuzzy Search
     ↓
Apply Scoring: Combine all search results
     ↓
Return Top 5: Display as cards + voice description
```

### 4. Open-Source Search & Recommendations

#### Vector Search with Free Models
```
User Query → Sentence Transformer → Vector Embedding
    ↓              ↓                      ↓
"modern house" → all-MiniLM-L6-v2 → [0.2, -0.5, 0.8...]
               (Hugging Face Model)       ↓
                                    PostgreSQL + pgvector
                                          ↓
                                    Cosine Similarity Search
                                          ↓
                                    Top K Similar Properties
```

#### Hybrid Search Implementation
```python
# All open-source components:
1. Keyword Search
   - PostgreSQL Full-Text Search (built-in)
   - No external dependencies

2. Vector Search (Semantic)
   - Model: sentence-transformers/all-MiniLM-L6-v2 (free)
   - Database: PostgreSQL + pgvector extension (free)
   - Alternative: ChromaDB (embedded, free)

3. Fuzzy Search (Typo Tolerance)  
   - PostgreSQL pg_trgm extension (built-in)
   - Levenshtein distance matching

# Ranking Formula
final_score = (0.4 * keyword_score + 
               0.4 * vector_score + 
               0.2 * fuzzy_score)
```

#### Simple Implementation
```python
from sentence_transformers import SentenceTransformer
import psycopg2
import numpy as np

# Free open-source embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Embed property descriptions
def create_embeddings(properties):
    for prop in properties:
        embedding = model.encode(prop['description'])
        # Store in PostgreSQL with pgvector
        cursor.execute(
            "INSERT INTO property_embeddings (id, embedding) "
            "VALUES (%s, %s)",
            (prop['id'], embedding.tolist())
        )

# Search function
def search_properties(query, filters):
    # 1. Vector search
    query_embedding = model.encode(query)
    vector_results = cursor.execute(
        "SELECT id, embedding <=> %s AS distance "
        "FROM property_embeddings "
        "ORDER BY distance LIMIT 20",
        (query_embedding.tolist(),)
    )
    
    # 2. Keyword search
    keyword_results = cursor.execute(
        "SELECT id, ts_rank(search_vector, query) AS rank "
        "FROM properties, plainto_tsquery(%s) query "
        "WHERE search_vector @@ query "
        "ORDER BY rank DESC LIMIT 20",
        (query,)
    )
    
    # 3. Fuzzy search
    fuzzy_results = cursor.execute(
        "SELECT id, similarity(description, %s) AS score "
        "FROM properties "
        "WHERE description % %s "
        "ORDER BY score DESC LIMIT 20",
        (query, query)
    )
    
    # Merge and rank
    return combine_results(vector_results, keyword_results, fuzzy_results)
```

### 5. Viewing Scheduling Flow
```
User: "Schedule a viewing" → Extract Property ID → Check Calendar
         ↓                        ↓                     ↓
   Voice Input              From Context         Simple DB Query
         ↓                        ↓                     ↓
   AI Confirms ← Property Details + Available Slots
         ↓
   User Picks Time → Save to Database → Send Email
   
```

## Technology Stack (Free & Open-Source)

### Frontend
- **Framework**: React 18 (Create React App or Vite)
- **Styling**: TailwindCSS (free)
- **State**: Zustand or Context API
- **HTTP Client**: Axios
- **Voice**: Vapi.ai (has free tier)

### Backend  
- **Server**: Node.js + Express.js
- **Database**: PostgreSQL (free)
- **Vector Search**: PostgreSQL + pgvector extension
- **Cache**: Redis (free)
- **Auth**: JWT with bcrypt
- **File Storage**: Local filesystem

### AI/ML Stack (All Free)
- **Voice Agent**: Vapi.ai (free tier)
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2
- **NLP**: Hugging Face transformers
- **Search**: PostgreSQL full-text search
- **ML Library**: scikit-learn

### DevOps (Free Options)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (free tier)
- **Hosting**: Railway, Render, or Fly.io (free tiers)
- **Monitoring**: Uptime Kuma (self-hosted)

## Service Architecture (Simplified)

### Single Backend Server Structure
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── search.js
│   │   ├── voice.js
│   │   └── properties.js
│   ├── services/
│   │   ├── vapi.js
│   │   ├── search.js
│   │   └── recommendations.js
│   ├── models/
│   │   ├── user.js
│   │   ├── property.js
│   │   └── conversation.js
│   ├── middleware/
│   │   └── auth.js
│   └── app.js
```

### Key Components

#### 1. Vapi.ai Integration (Free Tier)
```javascript
// services/vapi.js
const { Vapi } = require('@vapi-ai/server-sdk');

const vapi = new Vapi(process.env.VAPI_API_KEY);

async function createVoiceSession(userId) {
  const assistant = await vapi.calls.create({
    assistant: {
      model: "gpt-3.5-turbo", // Free tier model
      voice: "jennifer",
      firstMessage: "Hi! I'm here to help you find your dream property. What are you looking for?",
      functions: [{
        name: "searchProperties",
        description: "Search properties",
        parameters: {
          type: "object",
          properties: {
            location: { type: "string" },
            maxPrice: { type: "number" },
            bedrooms: { type: "number" }
          }
        }
      }]
    }
  });
  return assistant;
}
```

#### 2. Search Service with PostgreSQL
```javascript
// services/search.js
const { SentenceTransformer } = require('sentence-transformers');
const pg = require('pg');

class SearchService {
  constructor() {
    this.db = new pg.Pool({
      connectionString: process.env.DATABASE_URL
    });
    // Note: In production, use Python microservice for embeddings
    this.modelUrl = 'http://localhost:5000/embed'; // Python embedding service
  }

  async searchProperties(query, filters) {
    // 1. Keyword search with PostgreSQL full-text
    const keywordResults = await this.db.query(`
      SELECT *, ts_rank(search_vector, query) AS rank
      FROM properties, plainto_tsquery($1) query
      WHERE search_vector @@ query
        AND price <= $2
        AND bedrooms >= $3
      ORDER BY rank DESC
      LIMIT 20
    `, [query, filters.maxPrice || 999999999, filters.bedrooms || 0]);

    // 2. Vector search (if embedding service available)
    let vectorResults = [];
    try {
      const embedding = await this.getEmbedding(query);
      vectorResults = await this.db.query(`
        SELECT *, (embedding <-> $1::vector) AS distance
        FROM properties
        WHERE price <= $2 AND bedrooms >= $3
        ORDER BY distance
        LIMIT 20
      `, [embedding, filters.maxPrice || 999999999, filters.bedrooms || 0]);
    } catch (e) {
      console.log('Vector search unavailable, using keyword only');
    }

    // 3. Fuzzy search for typos
    const fuzzyResults = await this.db.query(`
      SELECT *, similarity(description, $1) AS score
      FROM properties
      WHERE description % $1
        AND price <= $2
        AND bedrooms >= $3
      ORDER BY score DESC
      LIMIT 10
    `, [query, filters.maxPrice || 999999999, filters.bedrooms || 0]);

    // Merge and rank
    return this.mergeResults(keywordResults.rows, vectorResults, fuzzyResults.rows);
  }

  async getEmbedding(text) {
    // Call Python embedding service
    const response = await fetch(this.modelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  }
}
            index="properties",
            body=search_body
        )
        
    // Merge results from all search methods
    return mergedResults;
  }
}
```

#### 3. Simple Recommendation Logic
```javascript
// services/recommendations.js
class RecommendationService {
  calculateScore(property, userPreferences) {
    let score = 0;
    
    // Price match (40% weight)
    if (property.price <= userPreferences.maxPrice) {
      score += 0.4;
    }
    
    // Bedroom match (30% weight)
    if (property.bedrooms >= userPreferences.minBedrooms) {
      score += 0.3;
    }
    
    // Location match (30% weight)
    if (userPreferences.locations.includes(property.city)) {
      score += 0.3;
    }
    
    // Feature matching
    const matchedFeatures = property.features.filter(f => 
      userPreferences.desiredFeatures.includes(f)
    );
    score += (matchedFeatures.length / userPreferences.desiredFeatures.length) * 0.2;
    
    return score;
  }
  
  async getRecommendations(userId, searchResults) {
    const user = await this.getUserPreferences(userId);
    
    // Score all properties
    const scoredProperties = searchResults.map(property => ({
      ...property,
      score: this.calculateScore(property, user.preferences)
    }));
    
    // Sort by score and return top 5
    return scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
}
```

## Data Models (Simplified)

### Core Tables

```javascript
// Property Schema
const propertySchema = {
  id: 'SERIAL PRIMARY KEY',
  address: 'TEXT NOT NULL',
  city: 'VARCHAR(100)',
  state: 'VARCHAR(2)',
  zipCode: 'VARCHAR(10)',
  price: 'INTEGER',
  propertyType: 'VARCHAR(50)',
  bedrooms: 'INTEGER',
  bathrooms: 'DECIMAL(3,1)',
  sqft: 'INTEGER',
  description: 'TEXT',
  features: 'TEXT[]', // PostgreSQL array
  images: 'JSONB',    // Store as JSON
  agentName: 'VARCHAR(200)',
  agentPhone: 'VARCHAR(20)',
  agentEmail: 'VARCHAR(200)',
  status: 'VARCHAR(20) DEFAULT "ACTIVE"',
  createdAt: 'TIMESTAMP DEFAULT NOW()'
};

// User Schema
const userSchema = {
  id: 'SERIAL PRIMARY KEY',
  email: 'VARCHAR(255) UNIQUE',
  password: 'VARCHAR(255)', // bcrypt hash
  name: 'VARCHAR(200)',
  phone: 'VARCHAR(20)',
  createdAt: 'TIMESTAMP DEFAULT NOW()'
};

// User Preferences Schema
const userPreferencesSchema = {
  id: 'SERIAL PRIMARY KEY',
  userId: 'INTEGER REFERENCES users(id)',
  maxPrice: 'INTEGER',
  minBedrooms: 'INTEGER',
  locations: 'TEXT[]',
  desiredFeatures: 'TEXT[]',
  updatedAt: 'TIMESTAMP DEFAULT NOW()'
};

// Conversations Schema
const conversationSchema = {
  id: 'SERIAL PRIMARY KEY',
  userId: 'INTEGER REFERENCES users(id)',
  sessionId: 'VARCHAR(100)',
  transcript: 'JSONB',
  extractedData: 'JSONB',
  recommendedProperties: 'INTEGER[]',
  createdAt: 'TIMESTAMP DEFAULT NOW()'
};

// Scheduled Viewings Schema
const viewingSchema = {
  id: 'SERIAL PRIMARY KEY',
  userId: 'INTEGER REFERENCES users(id)',
  propertyId: 'INTEGER REFERENCES properties(id)',
  scheduledFor: 'TIMESTAMP',
  notes: 'TEXT',
  status: 'VARCHAR(50) DEFAULT "SCHEDULED"',
  createdAt: 'TIMESTAMP DEFAULT NOW()'
};
```

### PostgreSQL Database Setup

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(200),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties table with full-text search
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  price INTEGER,
  property_type VARCHAR(50),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  sqft INTEGER,
  description TEXT,
  features TEXT[],
  images JSONB,
  agent_name VARCHAR(200),
  agent_phone VARCHAR(20),
  agent_email VARCHAR(200),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  -- Full-text search column
  search_vector TSVECTOR,
  -- Vector embedding for semantic search
  embedding vector(384)
);

-- Create indexes for search
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_embedding ON properties USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_properties_description_trgm ON properties USING GIST (description gist_trgm_ops);

-- Update search vector trigger
CREATE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    to_tsvector('english', COALESCE(NEW.address, '') || ' ' ||
                          COALESCE(NEW.city, '') || ' ' ||
                          COALESCE(NEW.description, '') || ' ' ||
                          COALESCE(array_to_string(NEW.features, ' '), ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_search_vector
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  max_price INTEGER,
  min_bedrooms INTEGER,
  locations TEXT[],
  desired_features TEXT[],
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_id VARCHAR(100),
  transcript JSONB,
  extracted_data JSONB,
  recommended_properties INTEGER[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled viewings
CREATE TABLE viewings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  scheduled_for TIMESTAMP,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved properties
CREATE TABLE saved_properties (
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);
```

## API Design (Simple REST)

### Core Endpoints

```javascript
// Authentication
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user

// Properties
POST   /api/search            - Search properties
GET    /api/properties/:id    - Get property details
GET    /api/recommendations   - Get recommendations

// Voice
POST   /api/voice/session     - Start Vapi session
POST   /api/voice/webhook     - Vapi webhook

// User Actions
POST   /api/properties/:id/save    - Save property
DELETE /api/properties/:id/save    - Unsave property
POST   /api/viewings              - Schedule viewing
GET    /api/viewings              - Get user viewings
```

### Example API Implementation

```javascript
// routes/search.js
router.post('/search', async (req, res) => {
  const { query, filters } = req.body;
  
  try {
    const searchService = new SearchService();
    const results = await searchService.searchProperties(query, filters);
    
    // If user is logged in, get recommendations
    if (req.user) {
      const recommendationService = new RecommendationService();
      const scored = await recommendationService.getRecommendations(
        req.user.id, 
        results
      );
      return res.json({ properties: scored });
    }
    
    res.json({ properties: results });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// routes/voice.js  
router.post('/voice/webhook', async (req, res) => {
  const { type, call, functionCall } = req.body;
  
  if (type === 'function-call' && functionCall.name === 'searchProperties') {
    const params = functionCall.parameters;
    const results = await searchService.searchProperties(
      params.query,
      params
    );
    
    // Format for voice response
    const response = formatVoiceResponse(results);
    res.json({ result: response });
  }
});
```

## Deployment Strategy (Free Hosting)

### Simple Deployment Architecture
```
┌─────────────────────────────────────────────────────────┐
│         Frontend (Vercel/Netlify)                       │
│            React App (Free)                             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│      Backend (Railway/Render)                           │
│         Node.js API (Free)                              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│    PostgreSQL (Supabase/Neon)                           │
│      Database (Free Tier)                               │
└─────────────────────────────────────────────────────────┘
```

### Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: realestate
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/realestate
      REDIS_URL: redis://redis:6379
      VAPI_API_KEY: ${VAPI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      REACT_APP_API_URL: http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Simple CI/CD with GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and Test
        run: |
          cd backend
          npm install
          npm test
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
```

### Environment Variables
```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/realestate
REDIS_URL=redis://localhost:6379
VAPI_API_KEY=your_vapi_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Security & Performance

### Simple Authentication
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Simple rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Caching with Redis
```javascript
// Simple caching layer
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

async function getCached(key) {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
}

async function setCache(key, value, ttl = 3600) {
  await client.setex(key, ttl, JSON.stringify(value));
}

// Usage in routes
router.get('/properties/:id', async (req, res) => {
  const cached = await getCached(`property:${req.params.id}`);
  if (cached) return res.json(cached);
  
  const property = await db.query(
    'SELECT * FROM properties WHERE id = $1',
    [req.params.id]
  );
  
  await setCache(`property:${req.params.id}`, property.rows[0]);
  res.json(property.rows[0]);
});
```

## Implementation Roadmap

### Phase 1 MVP (2 Months)

#### Month 1: Core Features
- **Week 1-2**: Basic Setup
  - PostgreSQL database with pgvector
  - Node.js API with authentication
  - React frontend scaffold
  - Vapi.ai integration
  
- **Week 3-4**: Search & Voice
  - Property search with PostgreSQL
  - Vector embeddings setup
  - Voice conversation flow
  - Basic UI for property display

#### Month 2: Polish & Launch
- **Week 5-6**: Recommendations
  - Simple scoring algorithm
  - User preferences
  - Property matching
  
- **Week 7-8**: Testing & Deploy
  - Deploy to free hosting
  - Basic testing
  - Beta user feedback
  - Bug fixes

### MVP Features
1. **Must Have**
   - User registration/login
   - Voice search with Vapi.ai
   - Property search (keyword + vector)
   - View property details
   - Save properties
   - Schedule viewings

2. **Nice to Have**
   - Email notifications
   - Advanced filters
   - Property comparison
   - Agent dashboard

### Success Criteria
- 50 beta users
- 500 voice searches
- 20 viewing requests
- Working demo for investors