'use client';

import { Component } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  reset() {
    this.setState({ hasError: false, error: null });
    if (this.props.reset) {
      this.props.reset();
    } else {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.component || (
          <ErrorComponent
            className={this.props.className}
            errorMessage={this.state.error?.message}
            reset={() => this.reset()}
          />
        )
      );
    }

    return this.props.children;
  }
}

export function ErrorComponent({ className, errorMessage, reset }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 h-full', 'bg-transparent rounded-lg', className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">{errorMessage || 'An unexpected error occurred'}</p>
        </div>
        <Button onClick={reset && (() => reset())}>Try again</Button>
      </div>
    </div>
  );
}
