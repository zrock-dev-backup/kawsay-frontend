import { Component, ErrorInfo, ReactNode } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleReload}>
                Reload Page
              </Button>
            }
            sx={{ maxWidth: "800px", width: "100%" }}
          >
            <AlertTitle>Something went wrong.</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try reloading the page.
            </Typography>

            {/* Error Details Accordion */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Error Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {this.state.error && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Error Message:
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        p: 1,
                        borderRadius: 1,
                        fontFamily: "monospace",
                      }}
                    >
                      {this.state.error.toString()}
                    </Typography>
                  </Box>
                )}

                {this.state.errorInfo?.componentStack && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Component Stack:
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        p: 1,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
