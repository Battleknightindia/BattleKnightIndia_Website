"use client"

import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-100">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="text-sm text-red-600">
            Please refresh the page and try again
          </p>
        </div>
      )
    }

    return this.props.children
  }
} 