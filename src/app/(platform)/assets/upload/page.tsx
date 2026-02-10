import { UploadForm } from './components'

export default function AssetUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upload Assets</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload new assets to the catalog. Select an asset type, add files, and fill in metadata.
        </p>
      </div>

      <UploadForm />
    </div>
  )
}
