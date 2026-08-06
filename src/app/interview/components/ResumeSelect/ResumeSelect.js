import './ResumeSelect.sass';

export default function ResumeSelect({
  resumes,
  selectedResumeId,
  onSelectResume,
}) {
  return (
    <section className="resume_select">
      <h2 className="font_h4">이력서</h2>

      <div className="resume_list">
        {resumes.map((resume) => (
          <label
            key={resume.id}
            className="resume_item"
          >
            <input
              type="radio"
              name="resume"
              checked={selectedResumeId === resume.id}
              onChange={() => onSelectResume(resume.id)}
            />

            <span className="font_body_l_r">
              {resume.title}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}