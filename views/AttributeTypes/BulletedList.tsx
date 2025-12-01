import { AttributeProps, isAttributeType } from "@meridian-ui/meridian";
  
  export const ItemBulletListType = ({
    attribute,
    options,
  }: AttributeProps) => {
    if (!attribute || attribute.type !== 'bulleted-list') return <></>;
  
    // console.log('this is the attribute being rendered:', attribute)
    //the attribute.type that is being rendered is the bulleted-list type
  
    if (!isAttributeType(attribute)) {
      return <></>;
    }
  
    // now we know attribute has a value property
    if (!attribute.value) {
      return <></>;
    }
  
    // cast the value to string array since we know from the log it's an array
    const items = attribute.value as string[];
  
    // safety check to ensure it's actually an array
    if (!Array.isArray(items)) {
      console.warn('Eexpected array but got:', typeof items, items);
      return <></>;
    }
  
    return (
        <ul className="list-disc list-inside text-start ml-1 space-y-1 mb-3">
          {items.map((item: string, index: number) => (
            <li key={index} className="">
              {item}
            </li>
          ))}
        </ul>
    );
  };