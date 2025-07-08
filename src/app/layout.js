import './globals.scss';
import MuiThemeProvider from '@/lib/theme/MuiThemeProvider';
import EmotionRegistry from '@/lib/theme/EmotionRegistry';

export const metadata = {
  title: 'MiFiX AI- Workflows',
  description: 'A dynamic UI generated with Material-UI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <MuiThemeProvider>
            {children}
          </MuiThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
