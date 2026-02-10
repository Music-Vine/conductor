/**
 * Test script to validate asset type guards.
 * Run with: npx tsx src/types/__test-asset-guards.ts
 */

import type { Asset } from './asset'
import { isMusicAsset, hasMultiStageWorkflow } from './asset'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASSED: ${message}`)
}

console.log('Testing Asset Type Guards...\n')

// Create sample assets
const musicAsset: Asset = {
  type: 'music',
  id: '1',
  title: 'Test Music',
  contributorId: 'c1',
  contributorName: 'Test Contributor',
  platform: 'both',
  status: 'draft',
  fileKey: 'music.mp3',
  fileUrl: 'https://example.com/music.mp3',
  fileSize: 1024,
  tags: ['rock', 'upbeat'],
  genre: 'Rock',
  duration: 180,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const sfxAsset: Asset = {
  type: 'sfx',
  id: '2',
  title: 'Test SFX',
  contributorId: 'c1',
  contributorName: 'Test Contributor',
  platform: 'uppbeat',
  status: 'draft',
  fileKey: 'sfx.mp3',
  fileUrl: 'https://example.com/sfx.mp3',
  fileSize: 512,
  tags: ['explosion', 'impact'],
  category: 'Impact',
  duration: 3,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const motionAsset: Asset = {
  type: 'motion-graphics',
  id: '3',
  title: 'Test Motion',
  contributorId: 'c1',
  contributorName: 'Test Contributor',
  platform: 'uppbeat',
  status: 'draft',
  fileKey: 'motion.mp4',
  fileUrl: 'https://example.com/motion.mp4',
  fileSize: 2048,
  tags: ['transition', 'overlay'],
  resolution: '1920x1080',
  duration: 5,
  format: 'MP4',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Test isMusicAsset
assert(isMusicAsset(musicAsset) === true, 'isMusicAsset returns true for music asset')
assert(isMusicAsset(sfxAsset) === false, 'isMusicAsset returns false for SFX asset')
assert(
  isMusicAsset(motionAsset) === false,
  'isMusicAsset returns false for motion graphics asset'
)

// Test hasMultiStageWorkflow
assert(
  hasMultiStageWorkflow(musicAsset) === true,
  'hasMultiStageWorkflow returns true for music asset'
)
assert(
  hasMultiStageWorkflow(sfxAsset) === false,
  'hasMultiStageWorkflow returns false for SFX asset'
)
assert(
  hasMultiStageWorkflow(motionAsset) === false,
  'hasMultiStageWorkflow returns false for motion graphics asset'
)

// Test discriminated union type narrowing
function testTypeNarrowing(asset: Asset) {
  if (asset.type === 'music') {
    // Should have access to music-specific fields
    const bpm: number | undefined = asset.bpm
    const key: string | undefined = asset.key
    const instruments: string[] | undefined = asset.instruments
    assert(asset.platform === 'both' || asset.platform === 'music-vine' || asset.platform === 'uppbeat', 'Music asset can have any platform')
    return true
  } else {
    // Non-music assets should be locked to uppbeat
    assert(asset.platform === 'uppbeat', `${asset.type} asset must be locked to uppbeat`)
    return true
  }
}

assert(testTypeNarrowing(musicAsset), 'Type narrowing works for music asset')
assert(testTypeNarrowing(sfxAsset), 'Type narrowing works for SFX asset')
assert(testTypeNarrowing(motionAsset), 'Type narrowing works for motion graphics asset')

// Test platform locking for non-music assets
assert(
  sfxAsset.platform === 'uppbeat',
  'SFX asset is locked to uppbeat platform'
)
assert(
  motionAsset.platform === 'uppbeat',
  'Motion graphics asset is locked to uppbeat platform'
)

console.log('\n✅ All type guard tests passed!')
