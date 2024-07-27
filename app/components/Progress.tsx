export default function ModelLoadProgress({ percent, label }: { label: string, percent: number }) {
  return (
    <>
      <label htmlFor={label}>{label}</label>
      <progress id={label} value={percent} max="100">{percent}%</progress>
    </>
  )
}

