export default function NewsItem({news}){
  return(
    <>
      <p>{news.title}</p>
      <p>{news.date}</p>
    </>
  );
}