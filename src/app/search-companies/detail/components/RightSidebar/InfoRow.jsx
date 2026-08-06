export default function InfoRow({company}){
    return(
      <>
        <div>
          <span>대표자 </span>
          <span>{company.ceo}</span>
        </div>

        <div>
          <span>설립일 </span>
          <span>{company.founded}</span>
        </div>

        <div>
          <span>사원수 </span>
          <span>{company.employees}명</span>
        </div>

        <div>
          <span>홈페이지 </span>
          <span>{company.homepage}</span>
        </div>
      </>
    );
}