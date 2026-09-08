import * as Accordion from '@radix-ui/react-accordion'
import * as Switch from '@radix-ui/react-switch'
import { useId, type ReactNode } from 'react'
import { ChevronIcon } from '../../vendor/x/XIcons'
import styles from './EditorSidebar.module.css'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span>{children}</span>
    </label>
  )
}

export function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  const id = useId()
  return (
    <div className={styles.switchRow}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <Switch.Root id={id} className={styles.switch} checked={checked} onCheckedChange={onCheckedChange}>
        <Switch.Thumb className={styles.switchThumb} />
      </Switch.Root>
    </div>
  )
}

export function Section({ value, title, children }: { value: string; title: string; children: ReactNode }) {
  return (
    <Accordion.Item className={styles.section} value={value}>
      <Accordion.Header>
        <Accordion.Trigger className={styles.trigger}>
          {title}
          <ChevronIcon />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className={styles.content}>
        <div className={styles.sectionBody}>{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  max?: number
}) {
  const commit = (input: HTMLInputElement) => {
    const parsed = Number(input.value)
    const normalized = Number.isFinite(parsed)
      ? Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(parsed)))
      : 0
    input.value = String(normalized)
    onChange(normalized)
  }
  return (
    <label className={styles.metricField}>
      <span className={styles.label}>{label}</span>
      <input
        key={value}
        className={styles.input}
        type="number"
        min="0"
        max={max}
        defaultValue={value}
        onBlur={(event) => commit(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
    </label>
  )
}

export function DeferredNumberInput({
  label,
  value,
  onCommit,
  min = 0,
  max,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
  min?: number
  max?: number
}) {
  const commit = (input: HTMLInputElement) => {
    const parsed = Number(input.value)
    const normalized = Number.isFinite(parsed)
      ? Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min, Math.round(parsed)))
      : min
    input.value = String(normalized)
    onCommit(normalized)
  }
  return (
    <input
      key={value}
      className={styles.input}
      aria-label={label}
      type="number"
      min={min}
      max={max}
      step="1"
      defaultValue={value}
      onBlur={(event) => commit(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}
