import { ItemResaurant } from "./ItemViews/MapCustomItemView";
import {ItemResaurantGrid} from './ItemViews/GridCustomItemView'
// import { OverviewBasicList } from "meridian/src/components/overviews/overview-basic-list";
// import { AttributeLink } from "./attribute-link";
import { DetailRestaurant } from "./DetailViews/DetailRestaurant";
import { OpenViewIn } from "@meridian-ui/meridian";
import { OverviewMap } from "./OverViews/OverviewMap";
import { ItemBulletListType } from "./AttributeTypes/BulletedList";
import { ButtonTagType } from "./AttributeTypes/ButtonTag";
import { ItemResaurantList } from "./ItemViews/ListCustomItemView";
import { OverviewCanvas } from "./OverViews/OverviewCanvas";
// import { ItemResaurantCanvas } from "./ItemViews/CanvasCustomItemView";
// import { LinkArrowType } from "./AttributeTypes/LinkArrow";

export const restaurantConfig = {
  // customAttributeTypes: [
  //   { type: 'link', view: AttributeLink },
  // ],
  customDetailViewTypes: [
    { type: "detail-restaurant", view: DetailRestaurant, defaultSpec: {} },
  ],

  customAttributeTypes: [
    { type: 'bulleted-list', view: ItemBulletListType},
    {type: 'button-tag', view: ButtonTagType},
    // { type: 'link-arrow', view: LinkArrowType},
  ],

  customOverviewTypes: [
    {
      type: "canvas",
      view: OverviewCanvas,
      defaultSpec: {
        itemView: { type: "map-restaurant" },
        detailViews: [
          {
            type: "detail-restaurant",
            openFrom: ["item"],
            openIn: "pop-up" as OpenViewIn
          },
        ],
      },
    },
    
    {
      type: "map",
      view: OverviewMap,
      defaultSpec: {
        itemView: { type: "map-restaurant" },
        detailViews: [
          {
            type: "detail-restaurant",
            openFrom: ["item"],
            openIn: "pop-up" as OpenViewIn
            // openIn: "new-page" as OpenViewIn, 
          },
        ],
      },
    },
    
  ],
  customItemViewTypes: [
    { type: "map-restaurant", view: ItemResaurant }, 
    { type: "vertical", view: ItemResaurantGrid}, 
    { type: "profile", view: ItemResaurantList},
    // { type: "compact", view: ItemResaurantCanvas}

  ],

  onOpenDetailNewPage: (item: any) => {
    console.log('Navigating to restaurant:', item.itemId);
    console.log('Full URL will be:', `/restaurant/${item.itemId}`);
    console.log('Full item:', item);
    window.location.href = `/restaurant/${item.itemId}`;
  },

  onOpenOverviewNewPage: () => {
    window.location.href = `/`;
  },
};