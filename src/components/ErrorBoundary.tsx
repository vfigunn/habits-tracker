import { Component, type ReactNode, type ErrorInfo } from "react";
import i18n from "../i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const t = i18n.t.bind(i18n);
      return (
        <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="neo-card p-8 max-w-md w-full text-center space-y-4">
            <div className="text-4xl">{t("error.icon")}</div>
            <h2 className="text-xl font-black font-display uppercase text-black dark:text-white">
              {t("error.title")}
            </h2>
            <p className="text-xs text-gray-600 dark:text-neutral-400 font-bold uppercase">
              {t("error.description")}
            </p>
            {this.state.error && (
              <pre className="text-left text-[10px] bg-red-50 dark:bg-red-950/20 border-2 neo-border p-3 overflow-auto max-h-40 text-gray-700 dark:text-neutral-300 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="neo-btn px-6 py-3 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              {t("error.retry")}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
