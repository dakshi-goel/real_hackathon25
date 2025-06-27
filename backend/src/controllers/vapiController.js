const propertyService = require('../services/propertyService');

class VapiController {
  constructor() {
    this.conversationState = new Map();
  }

  handleWebhook(req, res) {
    const { type, call, request } = req.body;

    console.log('Vapi webhook received:', type);

    switch (type) {
      case 'function-call':
        return this.handleFunctionCall(req, res);
      case 'status-update':
        return this.handleStatusUpdate(req, res);
      case 'end-of-call-report':
        return this.handleEndOfCall(req, res);
      default:
        return res.json({ success: true });
    }
  }

  handleFunctionCall(req, res) {
    const { functionCall, call } = req.body;
    const { name, parameters } = functionCall;

    console.log('Function call:', name, parameters);

    switch (name) {
      case 'searchProperties':
        return this.searchProperties(parameters, res);
      case 'getPropertyDetails':
        return this.getPropertyDetails(parameters, res);
      case 'saveSearchCriteria':
        return this.saveSearchCriteria(parameters, call.id, res);
      default:
        return res.json({ 
          result: "I don't understand that request. Could you please rephrase?" 
        });
    }
  }

  searchProperties(parameters, res) {
    const criteria = {
      minPrice: parameters.minPrice,
      maxPrice: parameters.maxPrice,
      bedrooms: parameters.bedrooms,
      city: parameters.location || parameters.city,
      location: parameters.location || parameters.city,
      type: parameters.propertyType,
      propertyType: parameters.propertyType,
      features: parameters.features
    };

    const results = propertyService.searchProperties(criteria);

    if (results.length === 0) {
      return res.json({
        result: "I couldn't find any properties matching your criteria. Would you like to adjust your search parameters? You could try expanding your price range or looking in nearby areas."
      });
    }

    const voiceResponse = this.formatSearchResults(results);
    
    return res.json({
      result: voiceResponse,
      data: {
        properties: results,
        count: results.length
      }
    });
  }

  getPropertyDetails(parameters, res) {
    const property = propertyService.getPropertyById(parameters.propertyId);
    
    if (!property) {
      return res.json({
        result: "I couldn't find that property. Could you provide more details?"
      });
    }

    const voiceResponse = propertyService.formatPropertyForVoice(property);
    
    return res.json({
      result: voiceResponse,
      data: { property }
    });
  }

  saveSearchCriteria(parameters, callId, res) {
    this.conversationState.set(callId, parameters);
    
    return res.json({
      result: "I've saved your search criteria. Let me search for properties that match.",
      data: { saved: true }
    });
  }

  formatSearchResults(properties) {
    const count = properties.length;
    const topResults = properties.slice(0, 3);
    
    let response = `Great news! I found ${count} ${count === 1 ? 'property' : 'properties'} that match what you're looking for. `;
    
    if (count > 0) {
      response += "Let me tell you about the best matches: ";
      
      topResults.forEach((property, index) => {
        const priceStr = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(property.price);
        
        const bedroomStr = property.bedrooms === 0 ? 'studio' : 
                          property.bedrooms === 1 ? '1 bedroom' : 
                          `${property.bedrooms} bedroom`;
        
        // Include match score in voice response
        if (property.matchScore) {
          response += `${index + 1}. With a ${property.matchScore}% match score - `;
        } else {
          response += `${index + 1}. `;
        }
        
        response += `A ${bedroomStr} ${property.type} in ${property.city} for ${priceStr}. `;
        
        // Add a few key features
        if (property.features && property.features.length > 0) {
          const topFeatures = property.features.slice(0, 2).join(' and ');
          response += `It features ${topFeatures}. `;
        }
      });
      
      if (count > 3) {
        response += `I have ${count - 3} more excellent options. Would you like to hear about them or would you prefer to refine your search?`;
      } else {
        response += "Would you like more details about any of these properties?";
      }
    }
    
    return response;
  }

  handleStatusUpdate(req, res) {
    const { status, call } = req.body;
    console.log(`Call ${call.id} status: ${status}`);
    return res.json({ success: true });
  }

  handleEndOfCall(req, res) {
    const { call } = req.body;
    this.conversationState.delete(call.id);
    console.log(`Call ${call.id} ended`);
    return res.json({ success: true });
  }
}

module.exports = new VapiController();