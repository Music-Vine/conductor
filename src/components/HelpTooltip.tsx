'use client'

import * as Tooltip from '@radix-ui/react-tooltip'

interface HelpTooltipProps {
  text: string
  className?: string
}

/**
 * A small ? icon that shows a hover tooltip with explanatory text.
 * Requires TooltipProvider to be present in the component tree.
 */
export function HelpTooltip({ text, className }: HelpTooltipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label="Learn more"
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-500 hover:border-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 ${className ?? ''}`}
        >
          ?
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={5}
          className="z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
        >
          {text}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
