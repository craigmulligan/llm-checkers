import useClient from '../hooks/useClient'
import useSWR from 'swr'
import Loading from './Loading'

export default function ModelSelect({ onChange, disabled, label: labelText, value }: { onChange: (modelPath: string) => void, disabled: boolean, label: string, value: string }) {
  const client = useClient()
  const { data, error, isLoading } = useSWR('listDownloadedModels', () => client.system.listDownloadedModels())

  if (error) {
    return <div>{error.message}</div>
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div>
      <label hidden={true} htmlFor={labelText}>{labelText}</label>
      <select id={labelText} className="text-black w-full" onChange={(evt) => onChange(evt.target.value)} value={value} disabled={disabled}>
        <option value="" disabled>Select a model</option>
        {data?.map((model) => (
          <option key={model.path} value={model.path}>
            {model.path}
          </option>
        ))}
      </select>
    </div>
  );
}
