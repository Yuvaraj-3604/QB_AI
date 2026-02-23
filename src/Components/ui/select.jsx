import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

const SelectContext = React.createContext()

const Select = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
            <div className="relative" ref={selectRef} {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext)

    return (
        <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
        >
            {children}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <span ref={ref} className={`flex-1 text-left ${className || ''}`} {...props}>
            {children}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(SelectContext)

    if (!isOpen) return null

    return (
        <div
            ref={ref}
            className={`absolute top-full left-0 right-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${className || ''}`}
            {...props}
        >
            <div className="py-1">{children}</div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext)
    const isSelected = selectedValue === value

    const handleClick = () => {
        onValueChange && onValueChange(value)
        setIsOpen(false)
    }

    return (
        <div
            ref={ref}
            role="option"
            aria-selected={isSelected}
            className={`relative flex w-full cursor-pointer select-none items-center justify-between py-2 px-3 text-sm outline-none hover:bg-gray-100 ${isSelected ? 'bg-gray-50' : ''} ${className || ''}`}
            onClick={handleClick}
            {...props}
        >
            <span>{children}</span>
            {isSelected && <Check className="w-4 h-4 text-cyan-500" />}
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
