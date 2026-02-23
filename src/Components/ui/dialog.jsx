import * as React from "react"

const Dialog = ({ open, onOpenChange, children }) => {
    return (
        <>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { open, onOpenChange })
                }
                return child
            })}
        </>
    )
}

const DialogTrigger = React.forwardRef(({ className, children, onOpenChange, ...props }, ref) => {
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => onOpenChange && onOpenChange(true)}
            className={className}
            {...props}
        >
            {children}
        </button>
    )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef(({ className, children, open, onOpenChange, ...props }, ref) => {
    if (!open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => onOpenChange && onOpenChange(false)}
            />
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
                <div ref={ref} className={className} {...props}>
                    {children}
                </div>
            </div>
        </>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
    <div
        className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-muted-foreground ${className || ''}`}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }) => (
    <div
        className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
