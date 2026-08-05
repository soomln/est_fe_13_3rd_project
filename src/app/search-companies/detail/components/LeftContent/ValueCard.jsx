export default function ValueCard({value}){
  return(
    <article>
      {/* 아이콘 */}
      <p>{value.title}</p>
      <p>{value.description}</p>
    </article>
  );
}