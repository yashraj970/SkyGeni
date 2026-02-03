import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card sx={{ m: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 4,
              }}
            >
              <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Something went wrong
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, textAlign: "center" }}
              >
                {this.state.error?.message || "An unexpected error occurred"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
