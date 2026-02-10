'use client'

import { useState, useEffect } from 'react'
import { Input, Button } from '@music-vine/cadence'
import { ReactTags, type Tag } from 'react-tag-autocomplete'
import type { AssetType } from '@/types/asset'

export interface SharedMetadata {
  contributorId: string
  contributorName: string
  genre: string
  tags: string[]
}

interface SharedMetadataFormProps {
  assetType: AssetType
  onChange: (metadata: SharedMetadata) => void
  disabled?: boolean
}

// Mock contributors for the select dropdown
const MOCK_CONTRIBUTORS = [
  { id: 'c1', name: 'John Smith' },
  { id: 'c2', name: 'Sarah Johnson' },
  { id: 'c3', name: 'Michael Chen' },
  { id: 'c4', name: 'Emily Davis' },
  { id: 'c5', name: 'David Wilson' },
  { id: 'c6', name: 'Jessica Brown' },
  { id: 'c7', name: 'James Taylor' },
  { id: 'c8', name: 'Jennifer Martinez' },
  { id: 'c9', name: 'Robert Anderson' },
  { id: 'c10', name: 'Lisa Thompson' },
  { id: 'c11', name: 'William Moore' },
  { id: 'c12', name: 'Patricia Garcia' },
  { id: 'c13', name: 'Richard Rodriguez' },
  { id: 'c14', name: 'Mary Jackson' },
  { id: 'c15', name: 'Christopher White' },
  { id: 'c16', name: 'Linda Harris' },
  { id: 'c17', name: 'Daniel Clark' },
  { id: 'c18', name: 'Barbara Lewis' },
  { id: 'c19', name: 'Matthew Lee' },
  { id: 'c20', name: 'Susan Walker' },
]

// Genre options by asset type
const GENRE_OPTIONS: Record<AssetType, string[]> = {
  music: ['Rock', 'Pop', 'Electronic', 'Hip Hop', 'Cinematic', 'Classical', 'Jazz', 'Ambient', 'Folk', 'Country'],
  sfx: ['UI', 'Nature', 'Human', 'Transport', 'Industrial', 'Household', 'Animals', 'Weather'],
  'motion-graphics': ['Backgrounds', 'Transitions', 'Lower Thirds', 'Social Media', 'Logo Reveals'],
  'stock-footage': ['Nature', 'Urban', 'Business', 'Lifestyle', 'Technology', 'Travel'],
  lut: ['Cinematic', 'Vintage', 'B&W', 'Warm', 'Cool', 'HDR'],
}

// Common tag suggestions (music-focused, adapt as needed)
const COMMON_TAGS: Tag[] = [
  { value: 'upbeat', label: 'Upbeat' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'relaxing', label: 'Relaxing' },
  { value: 'dark', label: 'Dark' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'intense', label: 'Intense' },
  { value: 'piano', label: 'Piano' },
  { value: 'guitar', label: 'Guitar' },
  { value: 'strings', label: 'Strings' },
  { value: 'synth', label: 'Synth' },
  { value: 'drums', label: 'Drums' },
]

export function SharedMetadataForm({ assetType, onChange, disabled }: SharedMetadataFormProps) {
  const [contributorId, setContributorId] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState<Tag[]>([])

  // Notify parent of changes
  useEffect(() => {
    if (contributorId && genre) {
      const contributor = MOCK_CONTRIBUTORS.find(c => c.id === contributorId)
      onChange({
        contributorId,
        contributorName: contributor?.name || '',
        genre,
        tags: tags.map(t => String(t.value)),
      })
    }
  }, [contributorId, genre, tags, onChange])

  const genres = GENRE_OPTIONS[assetType] || []

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      {/* Contributor */}
      <div>
        <label htmlFor="contributor" className="block text-sm font-medium text-gray-900 mb-2">
          Contributor <span className="text-red-500">*</span>
        </label>
        <select
          id="contributor"
          value={contributorId}
          onChange={(e) => setContributorId(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-platform-primary focus:outline-none focus:ring-1 focus:ring-platform-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">Select a contributor...</option>
          {MOCK_CONTRIBUTORS.map(contributor => (
            <option key={contributor.id} value={contributor.id}>
              {contributor.name}
            </option>
          ))}
        </select>
      </div>

      {/* Genre */}
      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-900 mb-2">
          Genre <span className="text-red-500">*</span>
        </label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-platform-primary focus:outline-none focus:ring-1 focus:ring-platform-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">Select a genre...</option>
          {genres.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-2">
          Tags
        </label>
        <ReactTags
          selected={tags}
          suggestions={COMMON_TAGS}
          onAdd={(newTag) => setTags([...tags, { value: String(newTag.value), label: newTag.label }])}
          onDelete={(index) => setTags(tags.filter((_, i) => i !== index))}
          placeholderText="Add tags..."
          isDisabled={disabled}
          allowNew
          classNames={{
            root: 'react-tags',
            rootIsActive: 'is-active',
            rootIsDisabled: 'is-disabled',
            rootIsInvalid: 'is-invalid',
            label: 'sr-only',
            tagList: 'flex flex-wrap gap-2 mb-2',
            tagListItem: 'inline-flex',
            tag: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-platform-primary/10 text-platform-primary text-sm',
            tagName: 'text-sm',
            comboBox: 'relative',
            input: 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-platform-primary focus:outline-none focus:ring-1 focus:ring-platform-primary disabled:bg-gray-50 disabled:cursor-not-allowed',
            listBox: 'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            option: 'cursor-pointer select-none px-3 py-2 text-sm text-gray-900 hover:bg-gray-100',
            optionIsActive: 'bg-gray-100',
            highlight: 'font-medium',
          }}
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Press Enter to add custom tags or select from suggestions
        </p>
      </div>
    </div>
  )
}
