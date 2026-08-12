export default function FormSelect({
  name,
  value,
  label,
  options,
  onChange
}) 
{
  return (
    <div className="formItem">
      <label>{label}</label>

      <select key={label} name={name} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}