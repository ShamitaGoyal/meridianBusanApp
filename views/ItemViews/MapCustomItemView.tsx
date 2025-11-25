import React from 'react';
import { getAttributesByRole } from "@meridian-ui/meridian";
import { ItemViewConfig } from "@meridian-ui/meridian";
import { FetchedItemType, ViewOptions } from "@meridian-ui/meridian";
import { Attribute } from "@meridian-ui/meridian";

export interface ItemResaurantType extends ItemViewConfig {
  type: 'map-restaurant';
}


export const ItemResaurant = ({
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
    <div className={`p-1 bg-white shadow-2xl rounded-lg ${className}`} style={style}>
      <div className="flex flex-col items-center justify-center gap-1">
        {/* Image Thumbnail */}
            <div
      className="rounded-md overflow-hidden"
      style={{
        width: '150px',
        height: '100px',
      }}
    >

      {/* 1. thumbnaill image of restaurant */}
      <Attribute
        className="w-full h-full object-cover"
        style={{ objectFit: 'cover' }}
        options={options}
        attribute={getAttributesByRole(item, 'thumbnail')}
      />
    </div>
        {/* 2. title */}
        <Attribute
          className="text-[1rem] font-bold text-[#151c12] font-['Trebuchet MS'] break-words max-w-[10rem] leading-tight"
          options={options}
          attribute={getAttributesByRole(item, 'title')}
        />
        
        <div className="inline-flex gap-2">
        {/* 3. rating NUMBER */}
        <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'badge')} 
      />  

      {/* 4. STAR BADGE -> RANKING DATA */}
      <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'star-badge')} 
      /> 
      
      {/* 5. number of reviews */}
      <span className='inline-flex text-gray-700 opacity-70'>
       {/* review count  */}
       <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'num_reviews-subtitle')} 
      />   
      </span>
      </div>

        {/* 6. price level */}

      <span className='inline-flex flex-row-reverse gap-1'>
          <Attribute
          className=""
          options={options}
          attribute={getAttributesByRole(item, 'price-level')} 
        /> 
        
          {/* 7. what type of resturant it is */}
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

        {/* 10. adress */}
        <Attribute
        className="font-semibold mt-0 mb-2"
        options={options}
        attribute={getAttributesByRole(item, 'description')} 
      />       

        {/* 11. hours description */}
        <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'hours-description')} 
      /> 


        {/* 12. subtitle */}
        <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'subtitle')} 
      />       

        {/* 13. phone number */}
        <Attribute
        className=""
        options={options}
        attribute={getAttributesByRole(item, 'phone')} 
      />   

        {/* 14. link */}
        <Attribute
        className=" text-blue-600 underline"
        options={options}
        attribute={getAttributesByRole(item, 'link')} 
      />       
    

        {/* 15. review link */}
        <Attribute
        className="text-blue-600 underline"
        options={options}
        attribute={getAttributesByRole(item, 'review-link')} 
      />       


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
