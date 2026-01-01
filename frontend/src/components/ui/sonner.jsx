import * as React from 'react'
import { Toaster as Sonner } from 'sonner'

export function Toaster({ ...props }) {
    // Simple version without context for now, or you can add your theme context if you have one.
    const theme = 'system'

    return (
        <Sonner
            theme={theme}
            className='toaster group [&_div[data-content]]:w-full'
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                }
            }
            {...props}
        />
    )
}
