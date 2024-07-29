export default function ModelLoadProgress({
  percent,
  label,
}: {
  label: string;
  percent: number;
}) {
  return (
    <>
      <label hidden={true} htmlFor={label}>
        {label}
      </label>
      <progress className="w-full" id={label} value={percent} max="100">
        {percent}%
      </progress>
    </>
  );
}
