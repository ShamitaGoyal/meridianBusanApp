import { FetchedItemType, getAttributesByRole } from "@meridian-ui/meridian";
import { OverviewCanvasType } from "./OverviewCanvas";

// Generate cluster name based on common attributes
export const generateClusterName = (
    clusterItems: FetchedItemType[],
    clusterIdx: number,
    config: OverviewCanvasType
): { name: string; subtitle: string } => {
    let clusterName = `Cluster ${clusterIdx + 1}`;
    let clusterSubtitle = '';

    // Try to find common city/area name
    const cityCounts = new Map<string, number>();
    const cuisineCounts = new Map<string, number>();

    clusterItems.forEach((item: FetchedItemType) => {
        const cityAttr = getAttributesByRole(item, 'city-description');
        if (cityAttr && typeof cityAttr === 'object' && 'value' in cityAttr) {
            const city = String(cityAttr.value);
            cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
        }

        const cuisineAttr = getAttributesByRole(item, 'cuisine-tag');
        if (cuisineAttr && typeof cuisineAttr === 'object' && 'value' in cuisineAttr) {
            const cuisines = Array.isArray(cuisineAttr.value) ? cuisineAttr.value : [cuisineAttr.value];
            cuisines.forEach((c: string) => {
                if (c && typeof c === 'string') {
                    cuisineCounts.set(c, (cuisineCounts.get(c) || 0) + 1);
                }
            });
        }
    });

    // Use most common city if available
    if (cityCounts.size > 0) {
        const mostCommonCity = Array.from(cityCounts.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
        clusterName = mostCommonCity;
    }

    // Add cuisine info if there's a dominant cuisine
    if (cuisineCounts.size > 0) {
        const mostCommonCuisine = Array.from(cuisineCounts.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
        if (cuisineCounts.get(mostCommonCuisine)! >= clusterItems.length * 0.5) {
            clusterSubtitle = mostCommonCuisine;
        }
    }

    // Add clustering explanation to subtitle
    const clusteringType = config.clusteringAlgorithm === 'hierarchical' ? 'hierarchical' : 'proximity';
    const maxDist = config.clusteringAlgorithm === 'hierarchical'
        ? (config.hierarchicalMaxDistance ?? 3)
        : (config.clusterThreshold ?? 2);
    clusterSubtitle = clusterSubtitle
        ? `${clusterSubtitle} • Within ${maxDist}km`
        : `Within ${maxDist}km (${clusteringType})`;

    return { name: clusterName, subtitle: clusterSubtitle };
};

