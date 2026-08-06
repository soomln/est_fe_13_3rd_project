import './CoverLetterSelect.sass';

export default function CoverLetterSelect({
  coverLetters,
  selectedId,
  onSelect,
}) {
  return (
    <section className="cover_letter_select">
      <h3 className="font_h4">자소서</h3>

      <div className="cover_letter_list">
        {coverLetters.map((coverLetter) => (
          <label key={coverLetter.id} className="cover_letter_item">
            <input
              type="radio"
              name="coverLetter"
              checked={selectedId === coverLetter.id}
              onChange={() => onSelect(coverLetter.id)}
            />

            <span className="font_body_l_r">
              {coverLetter.title}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}