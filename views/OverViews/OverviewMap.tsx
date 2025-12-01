import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';
import {
  DetailView,
  FetchedAttributeValueType,
  FetchedItemType,
  MeridianItem,
  Overview,
  OverviewConfig,
  useODI,
  ViewOptions,
} from "@meridian-ui/meridian";
// import { ItemPin } from 'meridian/src/components/item-views/item-pin';
import { useState } from 'react';

export interface OverviewMapType extends OverviewConfig {
  type: 'map';
}

export const basicMapDefault: Partial<OverviewMapType> = {
  shownAttributes: ['key-attribute'],
  itemView: { type: 'pin' },
  detailViews: [
    {
      type: 'basic',
      openIn: 'pop-up',
      openFrom: ['item'],
    },
  ],
};

interface MapAttributes {
  coordinates: (Position | undefined)[];
  googleMapsAPIKey: string | undefined;
}

const getMapData = (items: FetchedItemType[]): MapAttributes => {
  let googleMapsAPIKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const coordinates = items.map((item) => {
    // Collect coordinates from internalAttributes
    const latAttribute = item.internalAttributes?.find(
      (attr) => attr && typeof attr === 'object' && attr.label === 'lat'
    );

    const lngAttribute = item.internalAttributes?.find(
      (attr) => attr && typeof attr === 'object' && attr.label === 'lng'
    );

    const numberCoordinate = {
      lat: isNaN(
        parseFloat((latAttribute as FetchedAttributeValueType)?.value ?? '0')
      )
        ? 0
        : parseFloat((latAttribute as FetchedAttributeValueType)?.value ?? '0'),
      lng: isNaN(
        parseFloat((lngAttribute as FetchedAttributeValueType)?.value ?? '0')
      )
        ? 0
        : parseFloat((lngAttribute as FetchedAttributeValueType)?.value ?? '0'),
    };

    // Optional: Check attributes as a fallback for Google Maps API Key
    if (!googleMapsAPIKey) {
      const apiKeyAttr = item.attributes.find(
        (attr) => attr && 'value' in attr && attr.id === 'googleMapsAPIKey'
      );
      if (apiKeyAttr) {
        googleMapsAPIKey = String((apiKeyAttr as any).value);
      }
    }
    return numberCoordinate;
  });

  return {
    coordinates,
    googleMapsAPIKey,
  };
};

export const OverviewMap = (options: ViewOptions) => {
  const mapOverview = options.overview as OverviewMapType;

  const { odi, setSelectedItemEntity, highlightAttributes } = useODI();

  const { coordinates, googleMapsAPIKey } = getMapData(
    odi?.dataBinding[0].items ?? []
  );

  // Ensure every position has both lat and lng defined
  if (!coordinates?.every((p) => p && p.lat !== null && p.lng !== null)) {
    return <div className="p-8 text-center text-gray-500">No valid coordinates found</div>;
  }

  const [hoveredItemId, setHoveredItemId] = useState('');

  const { defaultCenter, defaultZoom } = calculateMapBounds(
    coordinates.filter((p) => p && p.lat && p.lng)
  );

  // Find the detail view that should open from clicking this item
  const detailToOpen = mapOverview.detailViews?.find(
    (detail) => typeof detail === 'object' && detail.openFrom?.includes('item')
  ) as DetailView | undefined;

  return (
    <div className="w-full h-[78vh] flex flex-col items-center py-8 px-4">
      <div className="w-full h-[90vh] rounded-md overflow-hidden">
        <APIProvider apiKey={googleMapsAPIKey ?? ''}>
          <Map
            key={`map-${mapOverview.id}`}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
            style={{
              width: '100%',
              height: '100%',
            }}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom + 3}
          >
            {coordinates &&
              options.items.map((item, index) => {
                const position = coordinates.at(index);
                // Filter out coordinates with lat/lng of 0
                if (!position || (position.lat === 0 && position.lng === 0)) {
                  return null;
                }
                return (
                  <AdvancedMarker
                    key={`${item?.itemId}-${index}`}
                    position={position}
                    zIndex={hoveredItemId === item?.itemId ? 6 : 3}
                  >
                    <div
                      className={`flex items-center justify-center bg-white rounded-full shadow-md shadow-black/40 
                        transition ${detailToOpen && !highlightAttributes ? 'hover:scale-[1.12] active:scale-[1] cursor-pointer' : ''}`}
                      style={{
                        width: '100px',
                        height: 'auto',
                        borderRadius: '8px'    /* Optional: rounded corners */
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onWheel={(e) => {
                        const detailItem = document.getElementById(`map-item-${item?.itemId}`);
                        if (detailItem && detailItem.scrollHeight > detailItem.clientHeight) {
                          e.stopPropagation();
                        }
                      }}
                      onMouseOver={() => setHoveredItemId(item?.itemId ?? '')}
                      onMouseLeave={() => setHoveredItemId('')}
                      onClick={() => {
                        if (detailToOpen && !highlightAttributes) {
                          const generalItem = options.items.at(index);
                          if (generalItem && !('value' in generalItem)) {
                            setSelectedItemEntity(
                              detailToOpen,
                              generalItem.overviewIndex ?? 0,
                              generalItem.itemId ?? String(index),
                              { ...options, viewType: 'detail', overview: options.overview },
                              { x: 0, y: 0 }
                            );
                          }
                          if (detailToOpen?.openIn === 'new-page') {
                            options.onOpenDetailNewPage?.(options.items[index]);
                          }
                        }
                      }}
                    >
                      <MeridianItem
                        item={item}
                        options={options}
                        index={index}
                        itemView={options.overview.itemView}
                      />
                    </div>
                  </AdvancedMarker>

                );
              })}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};

type Position = {
  lat: number;
  lng: number;
};

type MapBounds = {
  defaultCenter: Position;
  defaultZoom: number;
};

const calculateMapBounds = (positions: (Position | undefined)[]): MapBounds => {
  const positionsFiltered = positions.filter(Boolean) as Position[];

  // Handle empty array or undefined positions
  if (!positionsFiltered || positionsFiltered.length === 0) {
    return {
      defaultCenter: { lat: 0, lng: 0 },
      defaultZoom: 2,
    };
  }

  // If only one position exists, center on it with a higher zoom
  if (positionsFiltered.length === 1) {
    return {
      defaultCenter: positionsFiltered[0],
      defaultZoom: 14, // Increased from 13
    };
  }

  // Find the bounds of all positions
  let bounds = {
    north: -90,
    south: 90,
    east: -180,
    west: 180,
  };

  // Calculate the bounds that contain all markers
  positionsFiltered.forEach((position) => {
    bounds.north = Math.max(bounds.north, position.lat);
    bounds.south = Math.min(bounds.south, position.lat);
    bounds.east = Math.max(bounds.east, position.lng);
    bounds.west = Math.min(bounds.west, position.lng);
  });

  // Calculate center
  const defaultCenter: Position = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };

  // Calculate zoom based on the size of the bounding box
  const latDistance = bounds.north - bounds.south;
  const lngDistance = bounds.east - bounds.west;

  // Reduce padding to allow for closer zoom
  const padding = 0.2; // Reduced from 0.5
  const paddedLatDistance = latDistance + padding;
  const paddedLngDistance = lngDistance + padding;

  // Calculate zoom based on the larger of the two dimensions
  const latZoom = Math.log2(360 / paddedLatDistance);
  const lngZoom = Math.log2(360 / paddedLngDistance);

  // Use the smaller zoom level to ensure all markers are visible
  let defaultZoom = Math.floor(Math.min(latZoom, lngZoom));

  // Add a zoom boost to get closer by default
  const zoomBoost = 5; // Increase this value for more zoom
  defaultZoom += zoomBoost;

  // Constrain zoom to reasonable limits
  defaultZoom = Math.max(defaultZoom, 4); // Don't zoom out beyond minZoom
  defaultZoom = Math.min(defaultZoom, 15); // Don't zoom in too far

  return { defaultCenter, defaultZoom };
};