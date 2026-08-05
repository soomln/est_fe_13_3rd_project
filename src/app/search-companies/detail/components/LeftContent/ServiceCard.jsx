export default function ServiceCard({service}){
  return(
    <article>
      <img src={service.logo} alt={service.description} />
      <p>{service.title}</p>
    </article>
  );
}