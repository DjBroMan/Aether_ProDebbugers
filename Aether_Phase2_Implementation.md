# Aether Phase 2: Native Capabilities & Integrations

The scaffolding and API layers (Units 1-5) are complete. This plan details the execution of **Layer 2 (Hardware)** and **Layer 5 (External Integrations)** across the Aether Expo Front-End.

### [Auth & Routing]
We will wire the landing screen button to actual Google Auth endpoints using `expo-auth-session/providers/google`.

### [Resolution Protocol & Camera]
Students need a way to snap and upload broken projectors to Cloudinary. Adding `report.tsx` with `expo-camera`.

### [AI Voice Engine]
Users can speak to their copilot natively. Modifying `ai.tsx` with `expo-av` Audio.Recording.

### [Document Pipeline]
Faculty Approvals generate PDF certificates securely saved directly to the device using `expo-file-system`.

### [Financial Gateway & Admin Dashboard]
Adding `finance.tsx` for mocked layout and `admin.tsx` mapping to `react-native-chart-kit`.
