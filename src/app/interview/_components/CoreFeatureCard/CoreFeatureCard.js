<section className="core_feature_card">
  <div className="card_left">

    <h3>{title}</h3>

    <p>{description}</p>

    <ul className="feature_list">
      {list.map((item) => (
        <li key={item}>
          <span className="material-symbols-rounded">
            check
          </span>

          {item}
        </li>
      ))}
    </ul>

  </div>

  <div className="card_right">
    <Image />
  </div>
</section>