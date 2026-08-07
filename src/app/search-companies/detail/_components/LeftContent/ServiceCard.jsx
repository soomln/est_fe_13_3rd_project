export default function ServiceCard({service}){
  return(
    <article>
      <img src={service.logo} alt={service.description} />
      <p>자세히 보기</p>
    </article>
  );
}