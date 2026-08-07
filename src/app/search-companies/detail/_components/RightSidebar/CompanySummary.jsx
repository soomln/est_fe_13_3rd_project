export default function CompanySummary({summaryItem}){
  return(
    <div>
      <span>{summaryItem.icon} </span>
      <span>{summaryItem.description}</span>
    </div>
  );
}