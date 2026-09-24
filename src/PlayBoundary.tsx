import { Component, type ReactNode } from 'react';

export class PlayBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main style={{ maxWidth: 480, margin: '15vh auto', padding: 24, color: '#183b48', background: '#fff8e8', fontFamily: 'system-ui' }}><h1>Let’s try again</h1><p>The adventure stopped for a moment. Your saved looks are still on this device.</p><button type="button" style={{ minHeight: 48, padding: '12px 24px' }} onClick={() => window.location.reload()}>Try again</button></main>;
    return this.props.children;
  }
}
