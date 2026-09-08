import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const common = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function ResetIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4.2 6.1A7 7 0 1 1 3 12" />
      <path d="M3.5 2.9v3.8h3.8" />
    </svg>
  )
}

export function MoveLeftIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m11.8 5-5 5 5 5" />
    </svg>
  )
}

export function MoveRightIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m8.2 5 5 5-5 5" />
    </svg>
  )
}

export function ReplaceIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M15.6 7.1A6.3 6.3 0 0 0 5 4.9L3.4 6.5" />
      <path d="M3.4 3v3.5h3.5" />
      <path d="M4.4 12.9A6.3 6.3 0 0 0 15 15.1l1.6-1.6" />
      <path d="M16.6 17v-3.5h-3.5" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4.5 6h11" />
      <path d="M8 3.8h4" />
      <path d="m6.2 6 .6 10h6.4l.6-10" />
      <path d="M8.5 8.5v5M11.5 8.5v5" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m5.2 10.2 3 3 6.7-7" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M10 3.2v9.2" />
      <path d="m6.8 9.4 3.2 3.2 3.2-3.2" />
      <path d="M4 15.8h12" />
    </svg>
  )
}

export function UndoIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M7.2 6.3 3.8 9.7l3.4 3.4" />
      <path d="M4.2 9.7h6.1a5.5 5.5 0 0 1 5.5 5.5" />
    </svg>
  )
}

export function RedoIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m12.8 6.3 3.4 3.4-3.4 3.4" />
      <path d="M15.8 9.7H9.7a5.5 5.5 0 0 0-5.5 5.5" />
    </svg>
  )
}
