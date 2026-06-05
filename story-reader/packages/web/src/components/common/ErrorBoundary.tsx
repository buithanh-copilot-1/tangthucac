import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <section className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h1 className="mt-4 text-base font-bold text-gray-900">Co loi hien thi</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Trang vua gap loi khi ve giao dien. Ban co the thu tai lai hoac quay ve trang chu.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              Thu lai
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="h-11 rounded-xl bg-primary-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Home size={15} />
              Trang chu
            </button>
          </div>
        </section>
      </main>
    );
  }
}
