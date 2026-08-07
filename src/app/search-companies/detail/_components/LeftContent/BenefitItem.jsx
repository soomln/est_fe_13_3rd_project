export default function BenefitItem({benefit}){
  return(
    <> 
      <article>
        {/* <img src={value.icon}></img> */}
        <p>{benefit.icon}</p>
        <p>{benefit.title}</p>
        <p>{benefit.description}</p>
      </article>
    </>
  );
}