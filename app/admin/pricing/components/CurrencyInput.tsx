'use client'

import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

interface CurrencyInputProps {
    value: number
    onChange: (value: number) => void
    disabled?: boolean
    placeholder?: string
    className?: string
}

export function CurrencyInput({ value, onChange, disabled, placeholder, className }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('')

    useEffect(() => {
        // Format the initial value
        setDisplayValue(value > 0 ? value.toFixed(2) : '')
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value

        // Remove all non-digit and non-decimal characters
        const cleaned = input.replace(/[^\d.]/g, '')

        // Ensure only one decimal point
        const parts = cleaned.split('.')
        let formatted = parts[0]
        if (parts.length > 1) {
            // Limit to 2 decimal places
            formatted += '.' + parts[1].slice(0, 2)
        }

        setDisplayValue(formatted)

        // Parse to number for onChange
        const numValue = parseFloat(formatted) || 0
        onChange(numValue)
    }

    const handleBlur = () => {
        // Format to 2 decimal places on blur
        const numValue = parseFloat(displayValue) || 0
        if (numValue > 0) {
            setDisplayValue(numValue.toFixed(2))
        } else {
            setDisplayValue('')
        }
    }

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                $
            </span>
            <Input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder || '0.00'}
                className={`pl-7 font-semibold ${className || ''}`}
            />
        </div>
    )
}
