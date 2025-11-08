# Avatar System Architecture

This document explains how all the components work together to create a "living" avatar that talks to users.

## System Components

### 1. GLB File: Holds Your Avatar
- **Location**: `/public/models/avatar.glb`
- **Format**: Binary GLTF (GLB) - standard 3D model format
- **Contains**:
  - 3D mesh geometry (the avatar's shape)
  - Materials and textures (colors, skin, clothing)
  - Morph targets (blend shapes) for facial animation
  - Optional: Bone animations for body movement

**Key Requirements**:
- Must include morph targets for mouth animation
- Common morph target names: `mouthOpen`, `jawOpen`, `viseme_aa`, etc.
- If no morph targets exist, the system falls back to scaling animations

### 2. Three.js: Displays and Animates It
- **Component**: `EnhancedThreeJSAvatar` in `Avatar3D.jsx`
- **Responsibilities**:
  - Loads the GLB file using `GLTFLoader`
  - Creates a 3D scene with camera, lights, and renderer
  - Renders the avatar at 60fps
  - Handles camera controls (zoom, rotate)

**Key Code**:
```javascript
const loader = new GLTFLoader()
loader.load(modelPath, (gltf) => {
  const model = gltf.scene
  scene.add(model)
  modelRef.current = model
})
```

### 3. Morph Targets: Move the Face for Speech & Expressions
- **What they are**: Pre-defined facial shapes stored in the GLB model
- **How they work**: Blend between different face shapes (e.g., closed mouth → open mouth)
- **Detection**: System searches for common names like `mouthOpen`, `jawOpen`, etc.

**Key Code**:
```javascript
// Find mouth morph target
if (child.morphTargetDictionary) {
  const mouthNames = ['mouthOpen', 'jawOpen', 'viseme_aa', ...]
  // Search and find matching morph target
  mouthMorphRef.current = { mesh: child, index: foundIndex }
}

// Animate mouth during speech
if (isSpeaking && mouthMorphRef.current) {
  mesh.morphTargetInfluences[index] = mouthOpen // 0.0 to 1.0
}
```

### 4. Animation Loop: Makes Avatar Feel Alive
- **Runs at**: 60fps (via `requestAnimationFrame`)
- **Updates**:
  - Mouth movement when speaking
  - Eye tracking (follows mouse cursor)
  - Idle animations (subtle rotation)
  - Emotion expressions (smile/frown)

**Key Code**:
```javascript
const animate = () => {
  requestAnimationFrame(animate)
  
  // Get current state
  const currentIsSpeaking = isSpeakingRef.current
  const currentAudioVolume = audioVolumeRef.current
  
  // Animate mouth if speaking
  if (currentIsSpeaking) {
    const mouthOpen = calculateMouthOpen(currentAudioVolume, time)
    mesh.morphTargetInfluences[index] = mouthOpen
  }
  
  // Eye tracking
  updateEyeTracking(mousePosition)
  
  // Render frame
  renderer.render(scene, camera)
}
animate()
```

### 5. Integration with Chat/TTS: Makes Avatar "Talk" to Users
- **Flow**:
  1. User sends message → `ChatBox.jsx`
  2. AI responds → Message added to chat
  3. TTS triggers → `useTTS` hook calls `speak()`
  4. TTS sets `isSpeaking = true` → Updates `audioVolume`
  5. Props flow to `Avatar3D` → `isSpeaking` and `audioVolume` passed down
  6. Animation loop reads props → Updates mouth morph target
  7. Avatar's mouth moves → User sees avatar "talking"

**Key Code Flow**:
```javascript
// ChatBox.jsx
const { speak, isSpeaking, audioVolume } = useTTS()
<Avatar3D isSpeaking={isSpeaking} audioVolume={audioVolume} />

// Avatar3D.jsx
function EnhancedThreeJSAvatar({ isSpeaking, audioVolume, ... }) {
  // Store in refs for animation loop access
  isSpeakingRef.current = isSpeaking
  audioVolumeRef.current = audioVolume
  
  // Animation loop reads from refs
  if (currentIsSpeaking) {
    animateMouth(currentAudioVolume)
  }
}
```

## Data Flow Diagram

```
User Message
    ↓
ChatBox (sends to AI)
    ↓
AI Response
    ↓
useTTS.speak() → isSpeaking = true, audioVolume updates
    ↓
Avatar3D receives props: { isSpeaking, audioVolume }
    ↓
Props stored in refs (isSpeakingRef, audioVolumeRef)
    ↓
Animation Loop (60fps) reads from refs
    ↓
Calculates mouthOpen value (0.0 to 1.0)
    ↓
Updates morphTargetInfluences[index] = mouthOpen
    ↓
Three.js renders updated mesh
    ↓
User sees avatar mouth moving! 🗣️
```

## Troubleshooting

### Avatar not talking?
1. **Check console logs**:
   - `🎬 Starting animation loop` - Loop is running
   - `✅ Model loaded successfully!` - GLB loaded
   - `✅ Found mouth morph target` - Morph target detected
   - `🔊 TTS started speaking` - TTS is working
   - `🎤 Avatar received isSpeaking=true` - Props received

2. **Check debug overlay** (top-left in dev mode):
   - Speaking: ✅ or ❌
   - Volume: Should be > 0 when speaking
   - Model: ✅ (model loaded)
   - Mouth: ✅ (morph target found)

3. **Common issues**:
   - Not in Voice Mode → Avatar only shows in Voice Mode
   - Auto-play disabled → Click 🔊 button in header
   - No morph targets → System uses fallback scaling (less visible)
   - Model not loading → Check console for errors, falls back to placeholder

## File Structure

```
src/
├── components/
│   ├── Avatar3D.jsx          # Main avatar component
│   ├── ChatBox.jsx           # Chat interface + TTS integration
│   └── Avatar3D.css          # Avatar styling
├── hooks/
│   └── useTTS.js             # Text-to-speech hook
└── config/
    └── avatar.js             # Avatar configuration

public/
└── models/
    └── avatar.glb            # Your 3D avatar model
```

## Next Steps

To make the avatar more "alive":
1. Add more morph targets (blink, eyebrow raise, etc.)
2. Enhance emotion detection (analyze message sentiment)
3. Add body animations (idle sway, gestures)
4. Improve eye tracking (more natural movement)
5. Add lip-sync (match mouth shape to phonemes)

