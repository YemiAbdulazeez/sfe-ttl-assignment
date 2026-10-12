'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Icon } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './FilterMenu.module.css'

export interface FilterChoice {
  value: string
  label: string
}

interface FilterMenuProps {
  label: string
  allLabel: string
  options: readonly FilterChoice[]
  value: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string | undefined) => void
}

function moveIndex(current: number, key: string, length: number): number | null {
  if (length === 0) return null
  if (key === 'ArrowDown') return Math.min(length - 1, current + 1)
  if (key === 'ArrowUp') return Math.max(0, current - 1)
  if (key === 'Home') return 0
  if (key === 'End') return length - 1
  return null
}

function matchTypeahead(labels: readonly string[], fromIndex: number, letter: string): number | null {
  const needle = letter.toLowerCase()
  for (let step = 1; step <= labels.length; step += 1) {
    const index = (fromIndex + step) % labels.length
    if (labels[index].toLowerCase().startsWith(needle)) return index
  }
  return null
}

export function FilterMenu({
  label,
  allLabel,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}: FilterMenuProps) {
  const listId = useId()
  const labelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const choices: FilterChoice[] = [{ value: '', label: allLabel }, ...options]
  const selectedIndex = Math.max(
    0,
    choices.findIndex((choice) => choice.value === (value ?? ''))
  )
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const closedLabel = choices[selectedIndex]?.label ?? allLabel

  function openMenu() {
    setActiveIndex(selectedIndex)
    onOpenChange(true)
  }

  useEffect(() => {
    if (!open) return
    optionRefs.current[selectedIndex]?.focus()
  }, [open, selectedIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      onOpenChange(false)
      const target = event.target
      const clickedControl = target instanceof Element && target.closest('a, button, input, select, textarea')
      if (!clickedControl) triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  function choose(choice: FilterChoice) {
    onChange(choice.value ? choice.value : undefined)
    onOpenChange(false)
    triggerRef.current?.focus()
  }

  function focusIndex(index: number) {
    setActiveIndex(index)
    optionRefs.current[index]?.focus()
  }

  function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (open) return
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onOpenChange(false)
      triggerRef.current?.focus()
      return
    }

    const moved = moveIndex(activeIndex, event.key, choices.length)
    if (moved !== null) {
      event.preventDefault()
      focusIndex(moved)
      return
    }

    if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
      const next = matchTypeahead(
        choices.map((choice) => choice.label),
        activeIndex,
        event.key
      )
      if (next !== null) {
        event.preventDefault()
        focusIndex(next)
      }
    }
  }

  return (
    <div ref={rootRef} className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? onOpenChange(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.value}>{closedLabel}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className={styles.menu}
          onKeyDown={onListKeyDown}
        >
          {choices.map((choice, index) => {
            const selected = choice.value === (value ?? '')
            return (
              <button
                key={choice.value || 'all'}
                ref={(node) => {
                  optionRefs.current[index] = node
                }}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={selected}
                className={cx(styles.option, index === 0 && styles.header, selected && styles.selected)}
                onClick={() => choose(choice)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
