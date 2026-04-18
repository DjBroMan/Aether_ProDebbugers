import { DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

/**
 * Root layout — only declares the route tree.
 * Auth-based navigation is handled by leaf screens:
 *   - app/index.tsx  : auto-redirect to tabs if already logged in
 *   - (tabs)/_layout : auth guard redirects to login when logged out
 *
 * DO NOT add navigation hooks here — the Stack is not ready
 * when layout effects fire, causing the 'navigate before mounting' crash.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="finance" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
