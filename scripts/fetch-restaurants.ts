// ========================
// FILE 2: scripts/fetch-restaurants.ts
// ========================

import dotenv from 'dotenv';
import path from 'path';
import { TripAdvisorAPI } from '../lib/tripadvisor-api';
import fs from 'fs/promises';

// manually load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  // configuration
  const API_KEY = process.env.TRIPADVISOR_API_KEY!;
  const BASE_LATITUDE = 35.1629;  // BUSAN CITY SOUTH KOREA - change this FOR WHICH AREA
  const BASE_LONGITUDE = 129.1638;
  const TOTAL_RESTAURANTS = 80; //because there are random resturants that don't have a photo or description

  if (!API_KEY) {
    console.error('Please set TRIPADVISOR_API_KEY environment variable');
    console.error('Create a .env.local file and add: TRIPADVISOR_API_KEY=your_key_here');
    process.exit(1);
  }

  const api = new TripAdvisorAPI(API_KEY);

  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });

    console.log('🎯 Starting TripAdvisor restaurant data collection...\n');

    // Step 1: Fetch basic restaurant data
    console.log('='.repeat(50));
    console.log('STEP 1: Fetching Restaurant Basic Data');
    console.log('='.repeat(50));
    
    const restaurants = await api.fetchAllRestaurants(
      BASE_LATITUDE, 
      BASE_LONGITUDE, 
      TOTAL_RESTAURANTS
    );

    if (restaurants.length === 0) {
      console.error('❌ No restaurants found. Check your API key and coordinates.');
      process.exit(1);
    }

    // Save basic restaurant data
    const restaurantsFile = path.join(dataDir, 'restaurants.json');
    await fs.writeFile(restaurantsFile, JSON.stringify(restaurants, null, 2));
    console.log(`💾 Saved ${restaurants.length} restaurants to restaurants.json\n`);

    // Step 2: Fetch detailed restaurant data + photos
    console.log('='.repeat(50));
    console.log('STEP 2: Fetching Restaurant Details + Photos');
    console.log('='.repeat(50));
    
    const restaurantDetails = await api.fetchAllRestaurantDetailsWithPhotos(restaurants);

    // Save detailed restaurant data (with photos included)
    const detailsFile = path.join(dataDir, 'restaurant-details.json');
    await fs.writeFile(detailsFile, JSON.stringify(restaurantDetails, null, 2));
    console.log(`💾 Saved details for ${restaurantDetails.length} restaurants to restaurant-details.json\n`);

    // Summary
    console.log('='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Basic restaurant data: ${restaurants.length} records`);
    console.log(`✅ Detailed restaurant data: ${restaurantDetails.length} records`);
    console.log(`📁 Files saved in: ${dataDir}`);
    console.log(`   • restaurants.json (${(await fs.stat(restaurantsFile)).size} bytes)`);
    console.log(`   • restaurant-details.json (${(await fs.stat(detailsFile)).size} bytes)`);
    
    // Show sample data
    console.log('\n📋 Sample restaurant:');
    console.log(JSON.stringify(restaurants[0], null, 2));
    
    if (restaurantDetails.length > 0) {
      console.log('\n📋 Sample restaurant details:');
      console.log(JSON.stringify(restaurantDetails[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Process interrupted. Cleaning up...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
