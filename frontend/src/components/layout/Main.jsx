import { cn } from '@/lib/utils'

function Main({ fixed, className, fluid, ...props }) {
    return (
        <main
            data-layout={fixed ? 'fixed' : 'auto'}
            className={cn(
                'px-4 py-6',
                fixed && 'flex grow flex-col overflow-hidden',
                !fluid && 'mx-auto w-full max-w-7xl',
                className
            )}
            {...props}
        />
    )
}

export { Main }
