import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error in app:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-8">
              We're sorry — an unexpected error occurred. Please try reloading the page, or reach out to us directly on WhatsApp if the problem continues.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                Back to Home
              </button>
              <a
                href="https://wa.me/250782424382"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                Contact Us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;