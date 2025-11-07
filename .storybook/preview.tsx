import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <div style={{ padding: '1rem' }}>
            <Story />
          </div>
        </SnackbarProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
