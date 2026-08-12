import styles from "@/app/search-companies/_components/InterviewFilter.module.sass"
import filters from "../data/filter";

export default function InterviewFilter(){
  return(
    <section className="filter">

    {filters.map((filter) => (
      <select key={filter.title}>
        {filter.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    ))}
    </section>
  );
}