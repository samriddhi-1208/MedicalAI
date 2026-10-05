import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MEDGUARDIAN APP ERROR BOUNDARY]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#1C1F2E] border border-slate-800 rounded-2xl p-8 shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Something went wrong</h2>
              <p className="text-sm text-slate-400 font-medium">
                An unexpected interface issue occurred. Click reload below to refresh the clinical workspace.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 bg-[#66729F] hover:bg-[#55608B] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
