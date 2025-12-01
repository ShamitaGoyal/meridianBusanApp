
import {
  Attribute,
  DetailViewConfig,
  FetchedItemType,
  getAttributesByRole,
  Role,
  useODI,
} from "@meridian-ui/meridian";
// import 'meridian/src/components/detail-views/detail-view.scss';

export interface DetailRestaurant extends DetailViewConfig {
  type: 'detail-restaurant';
}

export const DetailRestaurant = ({
  item,
}: {
  item: FetchedItemType | undefined;
}) => {
  const { selectedItemEntity } = useODI();
  if (!selectedItemEntity || !item) return <div></div>;


  return (
    <div key={item.itemId} className="mx-8 flex flex-col gap-8 p-15">

       <div className="text-left">
        {/* TITLE */}
        <Attribute
          className="text-[32px] font-bold text-[#00629B]"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'title')}
        />

        <div className="inline-flex gap-2">
        {/* rating NUMBER */}
        <Attribute
        className="text-lg text-gray-700 opacity-70"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'badge')} // ranking_data here
      />  

      {/* STAR BADGE -> RANKING DATA */}
      <Attribute
        className="text-lg text-gray-700 w-fit"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'star-badge')} // ranking_data here
      /> 
      
      {/* NUMBER OF REVIEWS */}
      <span className='inline-flex text-gray-700 opacity-70'>
       {/* review count  */}
       <Attribute
        className="text-lg"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'num_reviews-subtitle')} 
      />   
      </span>

      {/* PRICE LEVEL IF IT IS THERE */}
      <span className='inline-flex text-gray-700 opacity-70 gap-1'>
      ·
      <Attribute
        className="text-lg w-fit"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'price-level')} // ranking_data here
      /> 
       </span>

        {/* WHAT TYPE OF RESTURANT IT IS */}
       <span className='inline-flex text-gray-700 opacity-70 gap-1'>
      <Attribute
        className="text-lg w-fit"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'localized_name-subtitle')} // ranking_data here
      /> 
       </span>

       <span className='inline-flex text-gray-700 opacity-70 gap-1'>
       ·
      <Attribute
        className="text-lg w-fit"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'city-description')} // ranking_data here
      /> 
       </span>

       <span className='inline-flex text-gray-700 opacity-70 gap-1'>
       ·
      <Attribute
        className="text-lg w-fit"
        options={selectedItemEntity.options}
        attribute={getAttributesByRole(item, 'country-description')} // ranking_data here
      /> 
       </span>
      </div>  
        {/* adress DESCRIPTION  */}
        <Attribute
          className="text-lg text-gray-700 mt-2"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'description')} 
        />
      </div>

      {/* =========================== */}


      <div className="flex flex-row gap-10">

        {/* 1. image of the resturant */}
      <div className="flex-1 max-w-[250px]">
        <Attribute
          className="w-[250px] rounded-none"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'thumbnail')}
        />
      </div>

      <div className="flex-1 flex flex-col items-start">
        {/* 2. title of the restaurant */}
        {/* <Attribute
          className="text-[32px] font-bold text-[#00629B]"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'title')}
        /> */}

        {/* 3. hours/when is the resturant open */}

        <Attribute
          className=""
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'hours-description')} 
        />

        {/* 4. ranking_string */}
        <Attribute
          className="text-lg text-gray-700 mt-2"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'subtitle')} // ranking_data here
        />

        {/* 5. Phone number */}

        <span className='inline-flex mt-2 gap-3'>
          
        <Attribute
          className="text-lg text-blue-600 underline"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'phone')} // ranking_data here
        />
        |

        {/* 6. vist website link */}
        <span className='inline-flex text-lg text-blue-600 underline'>
          <Attribute
          className=""
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'link')} // ranking_data here
        />
        <i className="ri-arrow-right-up-line"></i>
        </span>
        |

      {/* 7. review link */}
        <span className='inline-flex text-lg text-blue-600 underline'>
          <Attribute
          className=""
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'review-link')} // ranking_data here
        />
        <i className="ri-arrow-right-up-line"></i>
        </span>

      </span>
          
        {/* 8. tags for cuisine   */}
        <Attribute
          className="text-lg text-gray-700"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'cuisine-tag')}
        />

         {/* 9. tags for features   */}
        <Attribute
          className="text-lg text-gray-700"
          options={selectedItemEntity.options}
          attribute={getAttributesByRole(item, 'features-tag')}
        />
      </div>
      </div>
    </div>
  );
};
