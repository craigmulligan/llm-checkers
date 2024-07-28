import useClient from '../hooks/useClient'
import useSWR from 'swr'
import Loading from './Loading'

export default function ModelSelect({ onChange }: { onChange: (modelPath: string) => void }) {
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
      <select className="text-black w-full" onChange={(evt) => onChange(evt.target.value)}>
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
