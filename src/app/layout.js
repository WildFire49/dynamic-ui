import './globals.scss';
import MuiThemeProvider from '@/lib/theme/MuiThemeProvider';
import EmotionRegistry from '@/lib/theme/EmotionRegistry';

export const metadata = {
  title: 'MiFiX AI',
  description: 'A dynamic UI generated with Material-UI',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
