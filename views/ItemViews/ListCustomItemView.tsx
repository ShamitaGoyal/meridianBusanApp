import React from 'react';
import {
  Attribute,
  FetchedItemType,
  getAttributesByRole,
  ItemViewConfig,
  ViewOptions,
} from "@meridian-ui/meridian";

export interface ItemResaurantType extends ItemViewConfig {
  type: 'profile';
}

export const ItemResaurantList = ({
  options,
  item,
  index,
  className,
  style,
}: {
  options: ViewOptions;
  item: FetchedItemType | undefined;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (!item) {
    console.log('No item provided, returning empty fragment');
    return <></>;
  }

  return (
    <div className='p-2 bg-gray-50 border-2 border-gray-200 w-full h-[250px] flex flex-row'>
      
      {/* 1. Image Thumbnail - FIXED on the left */}
      <div className="overflow-hidden rounded-none w-[300px] h-[200px] flex-shrink-0 mr-4">
        <Attribute 
          className="w-[300px] h-[200px] object-cover rounded-none"
          options={options}
          attribute={getAttributesByRole(item, 'thumbnail')}
        />
      </div>
      
      {/* Content area on the right - scrollable */}
      <div className="flex flex-col flex-1 gap-2 overflow-y-auto">
        
        <div className="flex flex-col justify-start">
          {/* 2. subtitle - ranking_data */}
          <div className="mt-2">
            <Attribute
              options={options}
              attribute={getAttributesByRole(item, 'subtitle')}
            />
          </div>    

          {/* 3. title */}
          <Attribute
            className="text-[1.4rem] text-[#151c12] font-['Trebuchet MS'] break-words leading-tight"
            options={options}
            attribute={getAttributesByRole(item, 'title')}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* 4. badge rating NUMBER */}
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'badge')} 
          />  

          {/* 5. STAR BADGE -> RANKING DATA */}
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'star-badge')} 
          /> 
        
          {/* 6. number of reviews */}
          <span className='inline-flex text-gray-700 opacity-70'>
            <Attribute
              className=""
              options={options}
              attribute={getAttributesByRole(item, 'num_reviews-subtitle')} 
            />   
          </span>
        </div>

        {/* 7. price level */}
        <div className='flex gap-2 flex-wrap'>
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'price-level')} 
          /> 
          
          {/* 8. what type of restaurant it is */}
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'localized_name-subtitle')} 
          />
        </div>

        {/* Location */}
        <div className='flex gap-1 flex-wrap'>
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'city-description')}
          />   
          ·
          {/* 9. which country it is */}
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'country-description')}
          />      
        </div>

        {/* 10. address */}
        <div>
          <Attribute
            className="font-semibold break-words"
            options={options}
            attribute={getAttributesByRole(item, 'description')} 
          />       
        </div>

        {/* 11. hours description */}
        <div>
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'hours-description')} 
          />    
        </div>

        {/* 13. phone number */}
        <div>
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'phone')} 
          />   
        </div>

        {/* 14. links */}
        <div className='flex gap-4 flex-wrap'>
          <Attribute
            className="text-blue-600 underline break-all"
            options={options}
            attribute={getAttributesByRole(item, 'link')} 
          />       

          {/* 15. review link */}
          <Attribute
            className="text-blue-600 underline break-all"
            options={options}
            attribute={getAttributesByRole(item, 'review-link')} 
          />       
        </div>

        {/* 16. cuisine tag */}
        <div className="flex gap-2 flex-wrap">
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'cuisine-tag')} 
          />      
        
          {/* 17. feature tag */}
          <Attribute
            className=""
            options={options}
            attribute={getAttributesByRole(item, 'features-tag')} 
          /> 
        </div> 
      </div>
    </div>
  );
};