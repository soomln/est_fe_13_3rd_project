export default function ValueCard({value}){
  return(
    <article>
      {/* <img src={value.icon}></img> */}
      <p>{value.icon}</p>
      <p>{value.title}</p>
      <p>{value.description}</p>
    </article>
  );
}