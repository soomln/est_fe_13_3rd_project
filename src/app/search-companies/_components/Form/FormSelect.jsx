export default function FormSelect({
  name,
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
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}