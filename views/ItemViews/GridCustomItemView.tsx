import React from 'react';
import {
  Attribute,
  FetchedItemType,
  getAttributesByRole,
  ItemViewConfig,
  ViewOptions,
} from "@meridian-ui/meridian";

export interface ItemResaurantType extends ItemViewConfig {
  type: 'vertical';
}


export const ItemResaurantGrid = ({
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
    <div className='p-2 bg-gray-50 border-2 border-gray-200 w-[320px] h-[500px] flex flex-col'>
      
      {/* 1. Image Thumbnail - FIXED OUTSIDE scrollable area */}
      <div className="overflow-hidden rounded-none w-[300px] h-[200px] flex-shrink-0">
        <Attribute 
          className="w-[300px] h-[200px] object-cover rounded-none"
          options={options}
          attribute={getAttributesByRole(item, 'thumbnail')}
        />
      </div>
      
      {/* Scrollable content area - everything else goes here */}
      <div className="flex flex-col flex-1 gap-2 mt-2 overflow-y-auto">
        
        <div className="flex flex-col justify-start flex-wrap">
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
        
        <div className="inline-flex gap-2">
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
        <span className='inline-flex gap-2'>
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
        </span>

        {/* 8. which city it is */}
        <span className='inline-flex gap-1'>
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
        </span>

        {/* 10. address */}
        <Attribute
          className="font-semibold mt-0 mb-2 break-words"
          options={options}
          attribute={getAttributesByRole(item, 'description')} 
        />       

        {/* 11. hours description */}
        <Attribute
          className=""
          options={options}
          attribute={getAttributesByRole(item, 'hours-description')} 
        />    

        {/* 13. phone number */}
        <Attribute
          className=""
          options={options}
          attribute={getAttributesByRole(item, 'phone')} 
        />   

        {/* 14. link */}
        <span className='inline-flex gap-4'>
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
        </span>

        {/* 16. cuisine tag */}
        <div className="">
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