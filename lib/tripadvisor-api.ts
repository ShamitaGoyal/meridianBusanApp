export class TripAdvisorAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.content.tripadvisor.com/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Generate nearby coordinates (unchanged)
  private generateNearbyCoordinates(baseLat: number, baseLng: number, index: number): [number, number] {
    const spacing = 0.03;
    const gridSize = 5;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const lat = baseLat + (row - Math.floor(gridSize / 2)) * spacing;
    const lng = baseLng + (col - Math.floor(gridSize / 2)) * spacing;
    return [lat, lng];
  }

  private generateNearbyCoordinatesGrid(baseLat: number, baseLng: number, index: number, gridSize: number): [number, number] {
    const spacing = 0.03;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const lat = baseLat + (row - Math.floor(gridSize / 2)) * spacing;
    const lng = baseLng + (col - Math.floor(gridSize / 2)) * spacing;
    return [lat, lng];
  }

  // Fetch restaurants from a specific location
 // Fetch restaurants using nearby_search
  async fetchRestaurants(latitude: number, longitude: number): Promise<any[]> {
    const url = `${this.baseUrl}/location/nearby_search`;
    const params = new URLSearchParams({
      key: this.apiKey,
      category: 'restaurants',
      latLong: `${latitude},${longitude}`,
      radius: '3',        // Same radius as before -> changed it to 3 because 2 was not working that mcuh
      radiusUnit: 'km',
      language: 'en'
    });

    try {
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) {
        console.error('API Error:', data.error);
        return [];
      }
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching restaurants for ${latitude}, ${longitude}:`, error);
      return [];
    }
  }


  // Fetch detailed information for a specific restaurant
  async fetchRestaurantDetails(locationId: number): Promise<any> {
    const url = `${this.baseUrl}/location/${locationId}/details`;
    const params = new URLSearchParams({
      key: this.apiKey,
      language: 'en',
      currency: 'USD'
    });

    try {
      await this.delay(200);
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      if (!response.ok) {
        console.warn(`Failed to fetch details for location ${locationId}: ${response.status}`);
        return null;
      }
      const data = await response.json();
      if (data.error) {
        console.warn(`API Error for location ${locationId}:`, data.error);
        return null;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching details for location ${locationId}:`, error);
      return null;
    }
  }

  // Fetch photos for a specific restaurant
  async fetchLocationPhotos(locationId: string | number, limit: number = 5): Promise<any[]> {
    const url = `${this.baseUrl}/location/${locationId}/photos`;
    const params = new URLSearchParams({
      key: this.apiKey,
      language: 'en',
      limit: limit.toString()
    });

    try {
      //delay response 
      await this.delay(200);
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: { 'accept': 'application/json' }
      });
      if (!response.ok) {
        console.warn(`Failed to fetch photos for location ${locationId}: ${response.status}`);
        return [];
      }
      const data = await response.json();
      if (data.error) {
        console.warn(`API Error for photos at ${locationId}:`, data.error);
        return [];
      }
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching photos for location ${locationId}:`, error);
      return [];
    }
  }

  // Add delay for rate limiting
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main method to fetch all restaurant data
  async fetchAllRestaurants(baseLat: number, baseLng: number, totalRestaurants: number = 50): Promise<any[]> {
    const restaurants: any[] = [];
    const seenIds = new Set<string>();

    let gridSize = 5;
    const maxGridSize = 9;

    while (restaurants.length < totalRestaurants && gridSize <= maxGridSize) {
      const gridPoints = gridSize * gridSize;
      console.log(`🚀 Trying grid size ${gridSize}x${gridSize} (${gridPoints} points)`);

      for (let i = 0; i < gridPoints; i++) {
        const [lat, lng] = this.generateNearbyCoordinatesGrid(baseLat, baseLng, i, gridSize);
        console.log(`📍 Grid point ${i + 1}/${gridPoints}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

        try {
          const newRestaurants = await this.fetchRestaurants(lat, lng);
          const uniqueRestaurants = newRestaurants.filter(r => {
            if (!seenIds.has(r.location_id.toString())) {
              seenIds.add(r.location_id.toString());
              return true;
            }
            return false;
          });
          restaurants.push(...uniqueRestaurants);
          console.log(`✅ Added ${uniqueRestaurants.length} new restaurants (${restaurants.length} total)`);

          if (restaurants.length >= totalRestaurants) {
            console.log(`🎯 Target of ${totalRestaurants} reached`);
            return restaurants.slice(0, totalRestaurants);
          }

          await this.delay(800);
        } catch (error) {
          console.error(`❌ API error at grid ${i + 1}:`, error);
        }
      }
      gridSize += 2;
      console.log(`⚠️ Not enough restaurants, expanding grid to ${gridSize}x${gridSize}`);
    }

    return restaurants.slice(0, totalRestaurants);
  }

  // Fetch details and photos together
  async fetchAllRestaurantDetailsWithPhotos(restaurants: any[]): Promise<any[]> {
    console.log(`🔍 Fetching details + photos for ${restaurants.length} restaurants...`);
    const results: any[] = [];

    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`📋 Fetching details + photos ${i + 1}/${restaurants.length}: ${restaurant.name || restaurant.location_id}`);

      const details = await this.fetchRestaurantDetails(restaurant.location_id);
      if (!details) {
        console.warn(`⚠️ Skipping ${restaurant.location_id} - no details found`);
        continue;
      }

      const photos = await this.fetchLocationPhotos(restaurant.location_id);
      details.photos = photos;
      results.push(details);
    }

    return results;
  }
}
