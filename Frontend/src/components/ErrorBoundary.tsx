
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground animate-fade-in">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertCircle className="h-12 w-12 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
                            <p className="text-muted-foreground">
                                We apologize for the inconvenience. A critical error has occurred.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted text-left overflow-auto max-h-48 text-sm font-mono border border-border">
                            {this.state.error?.message}
                        </div>

                        <Button onClick={this.handleReload} size="lg" className="w-full sm:w-auto">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
