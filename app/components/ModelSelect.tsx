import useClient from '../hooks/useClient'
import useSWR from 'swr'
import Loading from './Loading'

export default function ModelSelect({ onChange, disabled }: { onChange: (modelPath: string) => void, disabled: boolean }) {
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
      <select className="text-black w-full" onChange={(evt) => onChange(evt.target.value)} defaultValue={""} disabled={disabled}>
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
