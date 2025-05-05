// components/ErrorBoundary.tsx
'use client'; // This component should run on the client side

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  // Optional: A callback function to log errors externally
  // onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // This static method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter and should return a value to update state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error, errorInfo: null };
  }

  // This method is called after an error has been thrown by a descendant component.
  // It receives two arguments:
  // error - The error that was thrown.
  // errorInfo - An object with a componentStack key containing information about the component stack during the error.
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error("Uncaught error caught by Error Boundary:", error, errorInfo);

    // Store errorInfo in state to display it
    this.setState({ errorInfo });

    // Optional: Call a prop function to log externally
    // if (this.props.onError) {
    //   this.props.onError(error, errorInfo);
    // }
  }

  // Helper function to copy text to clipboard
  copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show a confirmation message
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      const { error, errorInfo } = this.state;
      return (
        <div style={{
          border: '1px solid #e53e3e', // red border
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fef2f2', // light red background
          color: '#c53030', // darker red text
          fontFamily: 'sans-serif',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#c53030' }}>Oops! Something went wrong.</h2>
          <p style={{ fontSize: '0.9em' }}>
            An unexpected error occurred while rendering this section.
          </p>

          {error && (
            <details style={{ marginTop: '15px', borderTop: '1px solid #fbd38d', paddingTop: '15px' }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', color: '#d69e2e' }}>
                Error Message
              </summary>
              <div style={{
                backgroundColor: '#fff',
                padding: '10px',
                borderRadius: '4px',
                marginTop: '10px',
                fontSize: '0.8em',
                whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
                wordBreak: 'break-word', // Break long words
                position: 'relative'
              }}>
                {error.message}
                <button
                  onClick={() => this.copyToClipboard(error.message)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    padding: '3px 8px',
                    fontSize: '0.7em',
                    backgroundColor: '#bee3f8', // light blue
                    color: '#2b6cb0', // darker blue
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                  title="Copy Error Message"
                >
                  Copy
                </button>
              </div>
            </details>
          )}

          {errorInfo && errorInfo.componentStack && (
            <details style={{ marginTop: '15px', borderTop: '1px solid #fbd38d', paddingTop: '15px' }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer', color: '#d69e2e' }}>
                Component Stack
              </summary>
              <div style={{
                backgroundColor: '#fff',
                padding: '10px',
                borderRadius: '4px',
                marginTop: '10px',
                fontSize: '0.8em',
                whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
                wordBreak: 'break-word', // Break long words
                position: 'relative',
                maxHeight: '200px', // Limit height for long stacks
                overflowY: 'auto' // Add scroll if needed
              }}>
                {errorInfo.componentStack}
                 <button
                  onClick={() => this.copyToClipboard(errorInfo.componentStack!)} // Use non-null assertion as we checked existence
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                     padding: '3px 8px',
                    fontSize: '0.7em',
                    backgroundColor: '#bee3f8', // light blue
                    color: '#2b6cb0', // darker blue
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                  title="Copy Component Stack"
                >
                  Copy
                </button>
              </div>
            </details>
          )}
           <button
              onClick={() => window.location.reload()} // Simple reload to reset state
              style={{
                display: 'block', // Make button a block element for spacing
                width: '100%', // Full width
                padding: '10px',
                marginTop: '20px',
                fontSize: '1em',
                backgroundColor: '#4299e1', // light blue
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
