import type { PresentationSettings, PreviewLocale } from '../../../domain/tweet/types'
import { Field, Section, Toggle } from '../EditorControls'
import { PanelSelect } from '../PanelSelect'

export function ExportSection({
  presentation,
  onChange,
}: {
  presentation: PresentationSettings
  onChange: (value: PresentationSettings) => void
}) {
  return (
    <Section value="export" title="导出设置">
      <Field label="预览语言">
        <PanelSelect
          label="预览语言"
          value={presentation.locale}
          onValueChange={(locale) => onChange({ ...presentation, locale: locale as PreviewLocale })}
          options={[
            ['zh-CN', '中文'],
            ['en-US', 'English'],
          ]}
        />
      </Field>
      <Field label="PNG 倍率">
        <PanelSelect
          label="PNG 倍率"
          value={String(presentation.exportScale)}
          onValueChange={(value) =>
            onChange({ ...presentation, exportScale: Number(value) as PresentationSettings['exportScale'] })
          }
          options={[
            ['1', '1×'],
            ['2', '2× 高清'],
            ['3', '3×'],
            ['4', '4× 超清'],
          ]}
        />
      </Field>
      <Toggle
        label="显示 Mockup 标识"
        checked={presentation.showMockup}
        onCheckedChange={(showMockup) => onChange({ ...presentation, showMockup })}
      />
    </Section>
  )
}
