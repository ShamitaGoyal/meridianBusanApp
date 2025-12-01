import { FetchedAttributeValueType, FetchedItemType } from "@meridian-ui/meridian";

// Helper function to get coordinates from item
export const getItemCoordinates = (item: FetchedItemType): { lat: number; lng: number } | null => {
    const latAttribute = item.internalAttributes?.find(
        (attr) => attr && typeof attr === 'object' && attr.label === 'lat'
    );
    const lngAttribute = item.internalAttributes?.find(
        (attr) => attr && typeof attr === 'object' && attr.label === 'lng'
    );

    if (!latAttribute || !lngAttribute) return null;

    const lat = parseFloat((latAttribute as FetchedAttributeValueType)?.value ?? '0');
    const lng = parseFloat((lngAttribute as FetchedAttributeValueType)?.value ?? '0');

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;

    return { lat, lng };
};

// Calculate distance between two coordinates using Haversine formula (returns distance in km)
export const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Hierarchical clustering using average linkage
// Takes points with coordinates and indices, returns clusters (only clusters with 2+ items)
export const hierarchicalClustering = (
    points: Array<{ coords: { lat: number; lng: number }; index: number }>,
    maxDistance: number
): Array<Array<number>> => {
    // Handle edge cases
    if (points.length === 0) return [];
    if (points.length === 1) return [];

    // Start with each point as its own cluster
    let clusters: Array<Array<number>> = points.map(p => [p.index]);

    // Calculate average distance between two clusters (average linkage)
    const averageClusterDistance = (
        cluster1: Array<number>,
        cluster2: Array<number>,
        pointsMap: Map<number, { lat: number; lng: number }>
    ): number => {
        let totalDistance = 0;
        let pairCount = 0;

        for (const idx1 of cluster1) {
            const coord1 = pointsMap.get(idx1);
            if (!coord1) continue;

            for (const idx2 of cluster2) {
                const coord2 = pointsMap.get(idx2);
                if (!coord2) continue;

                totalDistance += calculateDistance(coord1, coord2);
                pairCount++;
            }
        }

        return pairCount > 0 ? totalDistance / pairCount : Infinity;
    };

    // Create a map for quick coordinate lookup
    const pointsMap = new Map<number, { lat: number; lng: number }>();
    points.forEach(p => {
        pointsMap.set(p.index, p.coords);
    });

    // Iteratively merge closest clusters until no clusters are within maxDistance
    let merged = true;
    while (merged && clusters.length > 1) {
        merged = false;
        let minDistance = Infinity;
        let closestPair: [number, number] | null = null;

        // Find the two closest clusters
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const distance = averageClusterDistance(clusters[i], clusters[j], pointsMap);
                if (distance < minDistance && distance <= maxDistance) {
                    minDistance = distance;
                    closestPair = [i, j];
                }
            }
        }

        // Merge the closest pair if found
        if (closestPair) {
            const [i, j] = closestPair;
            const mergedCluster = [...clusters[i], ...clusters[j]];

            // Remove both clusters and add merged one
            clusters = clusters.filter((_, idx) => idx !== i && idx !== j);
            clusters.push(mergedCluster);
            merged = true;
        }
    }

    // Filter out single-point clusters (only return clusters with 2+ items)
    return clusters.filter(cluster => cluster.length > 1);
};

