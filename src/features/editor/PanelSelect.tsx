import * as Select from '@radix-ui/react-select'
import { ChevronIcon } from '../../vendor/x/XIcons'
import styles from './EditorSidebar.module.css'

export function PanelSelect({
  value,
  onValueChange,
  options,
  label,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<[string, string]>
  label: string
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className={styles.selectTrigger} aria-label={label}>
        <Select.Value />
        <Select.Icon>
          <ChevronIcon width={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent} position="popper" sideOffset={4}>
          <Select.Viewport>
            {options.map(([itemValue, text]) => (
              <Select.Item className={styles.selectItem} value={itemValue} key={itemValue}>
                <Select.ItemText>{text}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
