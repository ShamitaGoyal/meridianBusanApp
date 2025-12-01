import { AttributeProps, isAttributeType } from "@meridian-ui/meridian";

export const ButtonTagType = ({
  attribute,
  options,
}: AttributeProps) => {
  if (!attribute || attribute.type !== 'button-tag') return <></>;

  // console.log('this is the attribute being rendered:', attribute)
  //the attribute.type that is being rendered is the bulleted-list type

  if (!isAttributeType(attribute)) {
    return <></>;
  }

  const items = attribute.value as string[];


// safety check to ensure it's actually an array
if (!Array.isArray(items)) {
  console.warn('Eexpected array but got:', typeof items, items);
  return <></>;
}

return (
  <ul className="flex flex-row gap-2 flex-wrap mt-2 mb-1">
      {items.map((item: string, index: number) => (
        <li key={index} className="text-black bg-[#7c7c7b3f] rounded-4xl px-2 text-center text-nowrap">
          {item}
        </li>
      ))}
  </ul>
);
};