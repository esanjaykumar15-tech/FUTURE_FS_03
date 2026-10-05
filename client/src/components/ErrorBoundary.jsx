import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[ui error]', error?.message); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="container-page py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md">The page failed to load. Refresh to try again, or call us if it keeps happening.</p>
        <button type="button" className="btn btn-primary mt-8" onClick={() => window.location.reload()}>Refresh page</button>
      </div>
    );
  }
}
