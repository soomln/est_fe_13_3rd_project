import styles from "./CompanyCard.module.sass";

export default function CompanyCard({company}) {
  return (
    <article className={styles.card}>
        <div className={styles.logo}>
            <img src={company.logo} alt="" />
        </div>

    <h3>{company.name}</h3>

    <p>{company.category}</p>
    </article>
  );
}