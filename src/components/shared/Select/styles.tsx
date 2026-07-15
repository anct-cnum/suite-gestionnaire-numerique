import { ReactElement } from 'react'
import { GroupBase, InputProps, components as reactSelectComponents, StylesConfig } from 'react-select'

export function creerInputAvecAriaControls(ariaControlsId: string) {
  return function InputAvecAriaControls<Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
    props: InputProps<Option, IsMulti, Group>
  ): ReactElement {
    const ariaControls = [ariaControlsId, props['aria-controls']].filter(Boolean).join(' ')
    return <reactSelectComponents.Input {...props} aria-controls={ariaControls} />
  }
}

export function DropdownIndicator(): ReactElement {
  return (
    <svg height="24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="m12 13.1 5-4.9 1.4 1.4-6.4 6.3-6.4-6.4L7 8.1l5 5z" />
    </svg>
  )
}

// istanbul ignore next @preserve
export function dsfrSelectStyles<Option, IsMulti extends boolean = false>(): StylesConfig<Option, IsMulti> {
  return {
    control: (base) => ({
      ...base,
      backgroundColor: 'var(--background-contrast-grey)',
      border: 'none',
      borderRadius: '.25rem .25rem 0 0',
      boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
      color: 'var(--text-default-grey)',
      cursor: 'pointer',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-default-grey)',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 1000,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? 'var(--background-contrast-grey)' : undefined,
      borderBottom: '1px solid var(--border-default-grey)',
      color: 'var(--text-default-grey)',
      cursor: 'pointer',
    }),
  }
}
