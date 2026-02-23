import * as React from "react"

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue || value)

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value)
        }
    }, [value])

    const handleTabChange = (newValue) => {
        setActiveTab(newValue)
        if (onValueChange) {
            onValueChange(newValue)
        }
    }

    return (
        <div ref={ref} className={className} {...props}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
                }
                return child
            })}
        </div>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, children, activeTab, onTabChange, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}
            {...props}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, onTabChange })
                }
                return child
            })}
        </div>
    )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, activeTab, onTabChange, ...props }, ref) => {
    const isActive = activeTab === value

    return (
        <button
            ref={ref}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-background text-foreground shadow-sm' : ''
                } ${className || ''}`}
            onClick={() => onTabChange && onTabChange(value)}
            {...props}
        >
            {children}
        </button>
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, activeTab, ...props }, ref) => {
    if (activeTab !== value) return null

    return (
        <div
            ref={ref}
            role="tabpanel"
            data-state={activeTab === value ? "active" : "inactive"}
            className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
