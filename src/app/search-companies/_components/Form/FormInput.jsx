export default function FormInput({
  name,
  value,
  label,
  placeholder,
  type = "text",
  onChange,
}) {
  return (
    <div className="formItem">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}