import * as React from "react"

const listeners = new Set()
let memoryToasts = []

export function useToast() {
    const [toasts, setToasts] = React.useState(memoryToasts)

    React.useEffect(() => {
        const listener = (newToasts) => setToasts(newToasts)
        listeners.add(listener)
        return () => listeners.delete(listener)
    }, [])

    const toast = React.useCallback(({ title, description, variant = "default" }) => {
        const id = Math.random().toString(36).substr(2, 9)
        memoryToasts = [...memoryToasts, { id, title, description, variant }]
        listeners.forEach((listener) => listener(memoryToasts))

        setTimeout(() => {
            memoryToasts = memoryToasts.filter((t) => t.id !== id)
            listeners.forEach((listener) => listener(memoryToasts))
        }, 5000)
    }, [])

    return { toast, toasts }
}
