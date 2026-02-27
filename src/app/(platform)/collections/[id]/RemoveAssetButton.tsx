'use client'

export function RemoveAssetButton({ assetId }: { assetId: string }) {
  return (
    <button
      className="text-sm text-red-600 hover:text-red-800 ml-2"
      onClick={() => console.log('Remove asset', assetId)}
    >
      Remove
    </button>
  )
}
