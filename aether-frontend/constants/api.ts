import Constants from 'expo-constants';

// Expo local tunnel IP logic allows the phone to hit the laptop's backend server automatically!
const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

export const API_BASE_URL = `http://${ip}:3000`;
export const SOCKET_URL = `http://${ip}:3000`;
