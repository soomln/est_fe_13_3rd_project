export default function FormTextarea({
  name,
  value,
  onChange,
  label,
  placeholder,
}) {
  return (
    <div className="formItem">
      <label>{label}</label>

      <textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}