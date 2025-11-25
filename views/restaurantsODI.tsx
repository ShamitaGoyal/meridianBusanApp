import { BindingItemType, ODI } from "@meridian-ui/meridian";


const restaurantDataBinding: BindingItemType = {
  itemId: '.location_id',
  internalAttributes: [
    { value: '.latitude', label: 'lat' },
    { value: '.longitude', label: 'lng' },
  ],
  attributes: [

    //titles 
    { value: '.name', roles: ['title'] },

    //thumbnail 
    { value: '.photos[0].images.original.url', roles: ['thumbnail'], type: 'image' },

    //description
    { value: '.address_obj.address_string', roles: ['description'] },
    { value: '.address_obj.city', roles: ['city-description'] },
    { value: '.address_obj.country', roles: ['country-description'] },
    {condition:{exists: '.hours.weekday_text'}, value: '.hours.weekday_text', roles: ['hours-description'], type:"bulleted-list"},
    { condition:{exists: '.price_level'},  value: '.price_level', roles: ['price-level'] },

    //subtitle
    { condition:{exists: ".ranking_data.ranking_string"}, value: '.ranking_data.ranking_string', roles: ['subtitle'] },

    //localized_name-subtitle
    { value: '.category.localized_name', roles: ['localized_name-subtitle'] },

    //num_reviews-subtitle
    {condition:{exists: '.num_reviews'}, value: '.num_reviews', roles: ['num_reviews-subtitle'] },

    //badge
    {condition: {exists: '.rating'}, value: '.rating', roles: ['badge'] },
    {value: '.rating-star', roles: ['star-badge'] },

    //phone 
    { condition: { exists: '.phone' }, value: '.phone', roles: ['phone'] },

    //link
    { value: '.web_url', label: 'Visit website', type: 'link', roles: ['link'] },

    //review-link
    { value: '.write_review', label: 'Write a review', roles: ['review-link'], type:'link'},

    //tag
    { condition: { exists: '.cuisine' }, value: '.cuisine', type:"button-tag", roles: ['cuisine-tag'] },
    { condition: { exists: '.features' }, value: '.features', type:'button-tag',  roles: ['features-tag'] },

    
    //ai
    // { condition: { exists: '.num_reviews' }, value: '.num_reviews', id: 'Reviews', roles: ['ai'] },
  ],
}

export const restaurantODI: ODI = {
  dataBinding: [
    { id: 'restaurants', binding: restaurantDataBinding },
  ],
  overviews: [
    {id: 'resturants-canvas',
    type: 'canvas',
    itemView: { type: 'map-restaurant' },
    shownAttributes: ['title',  "thumbnail", "badge", "star-badge", "num_reviews-subtitle",
     "price-level", "localized_name-subtitle", "city-description", "country-description",
      "description", "hours-description", "subtitle", "phone", "link", "review-link", "cuisine-tag", "features-tag"],
    hiddenAttributes: ["city-description", "country-description", "price-level", "description", "hours-description", "cuisine-tag", "features-tag", "subtitle", "review-link", "phone"],
    detailViews: [
      {
        type: 'detail-restaurant',
        openFrom: ['thumbnail', 'title'],
        openIn: 'pop-up',
      },
    ],
  
  },

    {
      id: 'restaurants-table',
      type: 'table',
      // itemView: { type: 'vertical' },
      shownAttributes: ['title',  "thumbnail", "badge", "star-badge", "num_reviews-subtitle",
      "price-level", "localized_name-subtitle", "city-description", "country-description",
       "description", "hours-description", "subtitle", "phone", "link", "review-link", "cuisine-tag", "features-tag", "description", "hours-description", "review-link", "phone"],
      hiddenAttributes:  [],
      detailViews: [
        {
          type: 'detail-restaurant',
          openFrom: ['thumbnail', 'title'],
          openIn: 'pop-up',
        },
      ],
    },
    {
      id: 'restaurants-grid',
      type: 'grid',
      itemView: { type: 'vertical' },
      shownAttributes: ['title',  "thumbnail", "badge", "star-badge", "num_reviews-subtitle",
      "price-level", "localized_name-subtitle", "city-description", "country-description",
       "description", "hours-description", "subtitle", "phone", "link", "review-link", "cuisine-tag", "features-tag"],
      hiddenAttributes:  ["description", "hours-description", "review-link", "phone"],
      detailViews: [
        {
          type: 'detail-restaurant',
          openFrom: ['thumbnail', 'title'],
          openIn: 'pop-up',
        },
      ],
    },
    {
      id: 'restaurants-list',
      type: 'list',
      itemView: { type: 'profile' },
      shownAttributes: ['title',  "thumbnail", "badge", "star-badge", "num_reviews-subtitle",
      "price-level", "localized_name-subtitle", "city-description", "country-description",
       "description", "hours-description", "subtitle", "phone", "link", "review-link", "cuisine-tag", "features-tag"],
      hiddenAttributes:  ["description", "hours-description", "review-link", "phone"],
      detailViews: [
        {
          type: 'detail-restaurant',
          openFrom: ['thumbnail', 'title'],
          // openIn: 'cover',
        },
      ],
    },
    {
      id: 'restaurants-map',
      type: 'map',
      itemView: { type: 'map-restaurant' },
      shownAttributes: ['title',  "thumbnail", "badge", "star-badge", "num_reviews-subtitle",
       "price-level", "localized_name-subtitle", "city-description", "country-description",
        "description", "hours-description", "subtitle", "phone", "link", "review-link", "cuisine-tag", "features-tag"],
      hiddenAttributes: ["city-description", "country-description", "price-level", "description", "hours-description", "cuisine-tag", "features-tag", "subtitle", "review-link", "phone"],
      detailViews: [
        {
          type: 'detail-restaurant',
          openFrom: ['thumbnail', 'title'],
          openIn: 'pop-up',
        },
      ],
    },
  ],
  malleability: {
    composition: {},
  },
}