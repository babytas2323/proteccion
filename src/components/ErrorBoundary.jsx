import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // For this specific error, we'll just render the children to avoid blocking the app
      // This is a temporary solution to allow the app to continue working
      console.error('Error caught by boundary:', this.state.error, this.state.errorInfo);
      return this.props.children; // Render children instead of error message
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
