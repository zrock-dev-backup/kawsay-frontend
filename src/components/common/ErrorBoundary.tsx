// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }
  
  private handleReload = () => {
      window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Alert 
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={this.handleReload}>
                        Reload Page
                    </Button>
                }
                sx={{ maxWidth: '600px' }}
            >
                <AlertTitle>Something went wrong.</AlertTitle>
                <Typography variant="body2">
                    An unexpected error occurred. Please try reloading the page.
                </Typography>
                {this.state.error && (
                    <Typography variant="caption" display="block" sx={{ mt: 2, whiteSpace: 'pre-wrap', opacity: 0.7 }}>
                        {this.state.error.toString()}
                    </Typography>
                )}
            </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
