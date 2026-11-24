## Task: Implement Premium 3D RFID Model Loading Indicator ONLY

Implement a professional loading indicator inside the existing 3D RFID product viewer while the RFID reader GLB model is loading.

### Requirements
1. Display a centered loading UI inside the existing 3D viewer.
2. Show the title: **Loading RFID Reader**
3. Show actual GLB loading progress percentage (0–100%) whenever available.
4. Display a smooth animated progress bar.
5. Use a clean, premium design consistent with the existing application theme.
6. Support both Light Mode and Dark Mode.
7. Hide the loader automatically when the GLB model is fully loaded and ready to render.
8. Do not use artificial loading delays or fake progress.
9. Prevent a blank viewer while the model is loading.
10. If loading fails, show a simple error message with a Retry action.

### Technical Requirements
- Inspect the existing GLB loading implementation first.
- Reuse the existing Three.js / React Three Fiber / Drei loading mechanism.
- Use actual loading progress.
- Do not unnecessarily remount the Canvas.
- Preserve existing GLB caching and rendering behaviour.

### STRICT SCOPE
Modify ONLY the model loading indicator.

DO NOT modify:
- Background or page design.
- Glassmorphism or other UI styling.
- Toast notifications.
- 3D reader model, geometry or materials.
- Physical LEDs or LED logic.
- Camera, FOV, zoom or OrbitControls.
- RFID card design or animation.
- RFID punch logic, audio or employee selection.
- Activity logs, counters or dashboard.
- Dark Mode design or theme settings.

### Verification
Test in visible Google Chrome Dev:
- Initial page load shows the loader inside the viewer.
- Actual progress is displayed when available.
- Loader disappears after the model loads.
- No model-loading toast appears.
- Existing RFID functionality remains unchanged.

**Acceptance Criteria: Only the in-viewer 3D model loader is added. No unrelated files or features should be changed.**