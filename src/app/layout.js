import "./globals.scss";
import MuiThemeProvider from "@/lib/theme/MuiThemeProvider";
import EmotionRegistry from "@/lib/theme/EmotionRegistry";
import ErrorBoundaryWrapper from "@/components/error/ErrorBoundaryWrapper";
import GlobalErrorHandler from "@/components/error/GlobalErrorHandler";
import { AuthProvider } from "@/contexts/AuthContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";

export const metadata = {
  title: "MiFiX.ai",
  description: "Enterprise Grade AI Platform",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Enable user scaling for accessibility
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ overscrollBehavior: "none" }}>
        <EmotionRegistry>
          <MuiThemeProvider>
            <SnackbarProvider>
              <AuthProvider>
                <ErrorBoundaryWrapper>
                  <GlobalErrorHandler>{children}</GlobalErrorHandler>
                </ErrorBoundaryWrapper>
              </AuthProvider>
              <ThemeCustomizer />
            </SnackbarProvider>
          </MuiThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
