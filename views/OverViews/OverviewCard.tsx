import React from 'react';
import {
    DetailView,
    FetchedItemType,
    findItemDetailViewToOpen,
    MeridianItem,
    OverviewConfig,
    useODI,
    ViewOptions,
} from "@meridian-ui/meridian";

export interface OverviewCardType extends OverviewConfig {
    type: 'card';
    columns?: number;
}

export const OverviewCard = (options: ViewOptions) => {
    const { odi, setSelectedItemEntity, highlightAttributes } = useODI();
    const detailToOpen = findItemDetailViewToOpen(options, odi);
    const config = options.overview as OverviewCardType;
    const columns = config.columns || 3;

    const handleItemClick = (item: FetchedItemType) => {
        if (detailToOpen && !highlightAttributes) {
            setSelectedItemEntity(
                detailToOpen,
                item.overviewIndex ?? 0,
                item.itemId ?? '',
                {
                    ...options,
                    viewType: 'detail',
                    overview: {
                        ...options.overview,
                        detailViews: options.overview.detailViews,
                    },
                },
                { x: 0, y: 0 }
            );
        }
        if (detailToOpen?.openIn === 'new-page') {
            options.onOpenDetailNewPage(item);
        }
    };

    return (
        <div className="w-full p-4">
            <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
                {options.items.map((item, index) => (
                    <div
                        key={item.itemId ?? index}
                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleItemClick(item)}
                    >
                        <MeridianItem
                            item={item}
                            options={options}
                            index={index}
                            itemView={options.overview.itemView}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

