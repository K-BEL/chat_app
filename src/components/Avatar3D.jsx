import { useEffect, useRef, useState, Suspense, lazy } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { detectEmotion } from '../utils/sentiment'
import { AVATAR_CONFIG } from '../config/avatar'
import './Avatar3D.css'

// Convert Ready Player Me URL to GLB format if needed
function convertToGLBUrl(url) {
  if (!url) return null
  
  // If it's already a GLB URL, return as is
  if (url.includes('.glb') || url.includes('models.glb')) {
    return url
  }
  
  // Convert Ready Player Me URL to GLB format
  // Ready Player Me URLs typically look like: https://models.readyplayer.me/[avatar-id].png
  // GLB format: https://models.readyplayer.me/[avatar-id].glb
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Replace image extension with .glb
    const glbPath = pathname.replace(/\.(png|jpg|jpeg|webp)$/i, '.glb')
    return `${urlObj.origin}${glbPath}`
  } catch (error) {
    console.warn('Failed to convert avatar URL:', error)
    // Try appending .glb if URL doesn't have extension
    if (!url.includes('.')) {
      return `${url}.glb`
    }
    return url
  }
}

// Ready Player Me Avatar component with error handling
function ReadyPlayerMeAvatarComponent({ avatarUrl, isSpeaking, audioVolume, mousePosition, emotion, onError }) {
  const [error, setError] = useState(null)
  const glbUrl = convertToGLBUrl(avatarUrl)
  
  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])
  
  if (error) {
    return (
      <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>
        <p>Unable to load Ready Player Me avatar</p>
        <p style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '8px' }}>
          {error.message || 'Avatar access restricted or URL invalid'}
        </p>
      </div>
    )
  }
  
  // Try to dynamically import and use Canvas/Avatar
  const [Canvas, setCanvas] = useState(null)
  const [Avatar, setAvatar] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [OrbitControlsComponent, setOrbitControls] = useState(null)
  
  useEffect(() => {
    Promise.all([
      import('@react-three/fiber'),
      import('@readyplayerme/visage'),
      import('@react-three/drei').then(drei => drei.OrbitControls).catch(() => null)
    ]).then(([fiber, visage, OrbitControls]) => {
      setCanvas(() => fiber.Canvas)
      setAvatar(() => visage.Avatar)
      if (OrbitControls) {
        setOrbitControls(() => OrbitControls)
      }
      setLoading(false)
    }).catch((err) => {
      console.error('Failed to load Ready Player Me components:', err)
      setError(new Error('Ready Player Me components not available'))
      setLoading(false)
    })
  }, [])
  
  if (loading) {
    return <div style={{ color: '#fff', padding: '20px' }}>Loading avatar...</div>
  }
  
  if (!Canvas || !Avatar) {
    return (
      <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>
        Ready Player Me avatar unavailable
      </div>
    )
  }
  
  return (
    <Canvas
      camera={{ position: [0, 1.6, 2], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      onError={(err) => {
        console.error('Canvas error:', err)
        setError(err)
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      {OrbitControlsComponent && (
        <OrbitControlsComponent
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.05}
          minDistance={0.5}
          maxDistance={5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      )}
      <Avatar 
        modelSrc={glbUrl || avatarUrl}
        onError={(err) => {
          console.error('Avatar load error:', err)
          setError(new Error('Avatar access restricted. The "demo" subdomain has limitations. Please create a new avatar with your own Ready Player Me subdomain, or the avatar will fallback to the Three.js implementation.'))
        }}
      />
    </Canvas>
  )
}

// Lazy load Ready Player Me components to prevent breaking the app
const ReadyPlayerMeAvatar = lazy(() => {
  return Promise.resolve({
    default: ReadyPlayerMeAvatarComponent
  })
})


function Avatar3D({ isSpeaking, audioVolume, avatarUrl, currentMessage, useSingleModel = false }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [emotion, setEmotion] = useState('neutral')
  const [avatarError, setAvatarError] = useState(null)
  const containerRef = useRef(null)

  // Track mouse position for eye tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Normalize mouse position relative to container center
        const x = (e.clientX - centerX) / rect.width
        const y = (e.clientY - centerY) / rect.height
        
        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Detect emotion from current message
  useEffect(() => {
    if (currentMessage) {
      const detectedEmotion = detectEmotion(currentMessage)
      setEmotion(detectedEmotion)
    } else {
      setEmotion('neutral')
    }
  }, [currentMessage])

  // If using single model, always use Three.js implementation
  if (useSingleModel) {
    return (
      <EnhancedThreeJSAvatar 
        isSpeaking={isSpeaking} 
        audioVolume={audioVolume}
        mousePosition={mousePosition}
        emotion={emotion}
        modelPath={AVATAR_CONFIG.MODEL_PATH}
      />
    )
  }

  // If Ready Player Me avatar URL is provided, try to use Visage
  if (avatarUrl && !avatarError) {
    return (
      <div ref={containerRef} className="avatar-3d-container">
        <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Loading Ready Player Me avatar...</div>}>
          <ReadyPlayerMeAvatar 
            avatarUrl={avatarUrl}
            isSpeaking={isSpeaking}
            audioVolume={audioVolume}
            mousePosition={mousePosition}
            emotion={emotion}
            onError={(error) => {
              console.warn('Avatar load failed, falling back to Three.js:', error)
              setAvatarError(error)
            }}
          />
        </Suspense>
      </div>
    )
  }
  
  // Show error message or fallback
  if (avatarError) {
    return (
      <div ref={containerRef} className="avatar-3d-container">
        <div style={{ 
          color: '#fff', 
          padding: '20px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <p style={{ marginBottom: '12px' }}>⚠️ Ready Player Me Avatar Unavailable</p>
          <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '16px' }}>
            {avatarError.message || 'Avatar access restricted. Using fallback avatar.'}
          </p>
          <button
            onClick={() => setAvatarError(null)}
            style={{
              background: '#667eea',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Fallback to existing Three.js implementation with enhanced features
  return (
    <EnhancedThreeJSAvatar 
      isSpeaking={isSpeaking} 
      audioVolume={audioVolume}
      mousePosition={mousePosition}
      emotion={emotion}
    />
  )
}

function EnhancedThreeJSAvatar({ isSpeaking, audioVolume, mousePosition, emotion, modelPath = '/models/avatar.glb' }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const modelRef = useRef(null)
  const mixerRef = useRef(null)
  const mouthMorphRef = useRef(null)
  const eyeLeftRef = useRef(null)
  const eyeRightRef = useRef(null)
  const animationIdRef = useRef(null)
  
  // Use refs to store current prop values so animation loop can access them
  const isSpeakingRef = useRef(isSpeaking)
  const audioVolumeRef = useRef(audioVolume)
  const mousePositionRef = useRef(mousePosition)
  const emotionRef = useRef(emotion)
  
  // Update refs when props change
  useEffect(() => {
    isSpeakingRef.current = isSpeaking
    audioVolumeRef.current = audioVolume
    mousePositionRef.current = mousePosition
    emotionRef.current = emotion
    
    // Debug logging
    if (isSpeaking) {
      console.log('🎤 Avatar received isSpeaking=true, audioVolume=', audioVolume)
    }
  }, [isSpeaking, audioVolume, mousePosition, emotion])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.6, 2)
    camera.lookAt(0, 1, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Setup OrbitControls for zoom and rotation
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0) // Focus on avatar center (around head height)
    controls.enableDamping = true // Smooth camera movement
    controls.dampingFactor = 0.05
    controls.minDistance = 0.5 // Minimum zoom distance
    controls.maxDistance = 5 // Maximum zoom distance
    controls.maxPolarAngle = Math.PI / 1.5 // Prevent camera from going below ground
    controls.minPolarAngle = Math.PI / 3 // Limit vertical rotation
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x667eea, 0.5)
    pointLight.position.set(-5, 5, 5)
    scene.add(pointLight)

    sceneRef.current = scene

    // Load GLB model
    const loader = new GLTFLoader()
    const modelUrl = modelPath
    
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene
        model.scale.set(1, 1, 1)
        model.position.set(0, 0, 0)
        scene.add(model)
        modelRef.current = model

        console.log('✅ Model loaded successfully!')
        console.log('🔍 Searching for morph targets and bones...')
        
        let allMorphTargets = []
        let meshCount = 0
        
        // Find mouth morph target and eyes
        model.traverse((child) => {
          if (child.isMesh) {
            meshCount++
            console.log(`📦 Mesh found: "${child.name}" (${meshCount})`)
            
            // Look for mouth morph targets - check all possible names
            if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 0) {
              const morphNames = Object.keys(child.morphTargetDictionary)
              console.log(`  🎭 Morph targets in "${child.name}":`, morphNames)
              allMorphTargets.push(...morphNames.map(name => ({ mesh: child.name, name })))
              
              // Initialize morphTargetInfluences if not already initialized
              if (!child.morphTargetInfluences || child.morphTargetInfluences.length === 0) {
                const count = Object.keys(child.morphTargetDictionary).length
                child.morphTargetInfluences = new Array(count).fill(0)
                console.log(`  ✅ Initialized morphTargetInfluences array (${count} elements)`)
              }
              
              const mouthNames = [
                'mouthOpen', 'Mouth_Open', 'mouth_open', 'jawOpen', 'Jaw_Open',
                'jaw_open', 'mouthA', 'MouthA', 'viseme_aa', 'viseme_oh', 'viseme_ee',
                'jawDrop', 'JawDrop', 'mouthSmile', 'MouthSmile', 'jaw', 'Jaw',
                'mouth', 'Mouth', 'open', 'Open', 'A', 'aa', 'oh', 'ee'
              ]
              
              // Try exact matches first
              for (const name of mouthNames) {
                if (child.morphTargetDictionary[name] !== undefined) {
                  const index = child.morphTargetDictionary[name]
                  mouthMorphRef.current = {
                    mesh: child,
                    index: index
                  }
                  console.log(`  ✅ Found mouth morph target: "${name}" at index ${index}`)
                  break
                }
              }
              
              // Try case-insensitive partial matches
              if (!mouthMorphRef.current) {
                for (const morphName of morphNames) {
                  const lowerMorph = morphName.toLowerCase()
                  if (mouthNames.some(name => lowerMorph.includes(name.toLowerCase()))) {
                    const index = child.morphTargetDictionary[morphName]
                    mouthMorphRef.current = {
                      mesh: child,
                      index: index
                    }
                    console.log(`  ✅ Found mouth morph target (partial match): "${morphName}" at index ${index}`)
                    break
                  }
                }
              }
              
              // If still no mouth found, use first morph target as fallback
              if (!mouthMorphRef.current && morphNames.length > 0) {
                const firstKey = morphNames[0]
                const index = child.morphTargetDictionary[firstKey]
                mouthMorphRef.current = {
                  mesh: child,
                  index: index
                }
                console.log(`  ⚠️ Using first morph target as mouth fallback: "${firstKey}" at index ${index}`)
              }
            } else {
              console.log(`  ⚠️ No morph targets in "${child.name}"`)
            }
            
            // Look for eyes (common naming patterns)
            const childNameLower = child.name.toLowerCase()
            if ((childNameLower.includes('eye') || childNameLower.includes('left_eye')) && !eyeLeftRef.current) {
              eyeLeftRef.current = child
              console.log(`  👁️ Found left eye: "${child.name}"`)
            }
            if ((childNameLower.includes('eye') || childNameLower.includes('right_eye')) && !eyeRightRef.current) {
              eyeRightRef.current = child
              console.log(`  👁️ Found right eye: "${child.name}"`)
            }
          }
          
          // Also check bones for eye tracking
          if (child.isBone) {
            const boneNameLower = child.name.toLowerCase()
            if ((boneNameLower.includes('eye') || boneNameLower.includes('head')) && !eyeLeftRef.current) {
              eyeLeftRef.current = child
              console.log(`  👁️ Found left eye bone: "${child.name}"`)
            } else if ((boneNameLower.includes('eye') || boneNameLower.includes('head')) && !eyeRightRef.current) {
              eyeRightRef.current = child
              console.log(`  👁️ Found right eye bone: "${child.name}"`)
            }
          }
        })
        
        console.log(`📊 Summary: ${meshCount} meshes, ${allMorphTargets.length} total morph targets`)
        
        // If no mouth morph found, log warning and create fallback
        if (!mouthMorphRef.current) {
          console.warn('⚠️ No mouth morph target found. Will use model scaling as fallback.')
          console.log('💡 Tip: Your GLB model needs morph targets (blend shapes) for mouth animation.')
          console.log('💡 Common names: mouthOpen, jawOpen, viseme_aa, etc.')
        } else {
          console.log('✅ Mouth animation ready!')
        }

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model)
          gltf.animations.forEach((clip) => {
            mixerRef.current.clipAction(clip).play()
          })
          console.log('Playing', gltf.animations.length, 'animations')
        }
      },
      undefined,
      (error) => {
        console.warn('Could not load GLB model, using placeholder:', error)
        createPlaceholderAvatar(scene, modelRef, mouthMorphRef, eyeLeftRef, eyeRightRef)
      }
    )

    // Animation loop
    const clock = new THREE.Clock()
    console.log('🎬 Starting animation loop')
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const delta = clock.getDelta()
      if (mixerRef.current) {
        mixerRef.current.update(delta)
      }

      // Update orbit controls (required for damping)
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Get current values from refs
      const currentIsSpeaking = isSpeakingRef.current
      const currentAudioVolume = audioVolumeRef.current || 0
      const currentMousePosition = mousePositionRef.current
      const currentEmotion = emotionRef.current
      
      // Log first frame to confirm loop is running
      if (clock.getElapsedTime() < 0.1) {
        console.log('✅ Animation loop running!', {
          isSpeaking: currentIsSpeaking,
          audioVolume: currentAudioVolume,
          hasModel: !!modelRef.current,
          hasMouthMorph: !!mouthMorphRef.current
        })
      }

      // Mouth movement based on speaking state
      if (currentIsSpeaking) {
        // Always use time-based animation for smooth mouth movement
        const time = clock.getElapsedTime()
        let mouthOpen = 0
        
        if (currentAudioVolume > 0.1) {
          // Use audio volume as base, add time-based variation
          const baseVolume = Math.min(currentAudioVolume * 2.5, 0.8)
          const timeVariation = Math.abs(Math.sin(time * 10)) * 0.2
          mouthOpen = Math.min(1.0, baseVolume + timeVariation)
        } else {
          // Time-based animation when no volume data available
          // Create a talking animation based on time
          mouthOpen = Math.abs(Math.sin(time * 8)) * 0.6 + 0.4 // Oscillate between 0.4 and 1.0
        }
        
        // Ensure mouth is always moving when speaking
        mouthOpen = Math.max(0.3, mouthOpen) // Minimum opening when speaking
        
        // Debug: Log every 2 seconds when speaking
        if (Math.floor(time) % 2 === 0 && Math.floor(time * 10) % 20 === 0) {
          console.log('🗣️ Animation loop: isSpeaking=true, mouthOpen=', mouthOpen.toFixed(2), 'audioVolume=', currentAudioVolume.toFixed(2))
        }
        
        if (mouthMorphRef.current) {
          const { mesh, index } = mouthMorphRef.current
          
          if (mesh.morphTargetInfluences && index !== undefined && index < mesh.morphTargetInfluences.length) {
            // Use morph target - ensure array exists and index is valid
            mesh.morphTargetInfluences[index] = mouthOpen
            // Debug log every 60 frames (about once per second at 60fps)
            if (Math.floor(time * 60) % 60 === 0) {
              console.log(`🗣️ Speaking: mouthOpen=${mouthOpen.toFixed(2)}, morph[${index}]=${mesh.morphTargetInfluences[index].toFixed(2)}`)
            }
        } else if (mesh.scale) {
          // Fallback: scale the mouth for placeholder
            const newScale = 0.1 + mouthOpen * 0.9
            mesh.scale.y = newScale
            mesh.scale.x = 0.8 + mouthOpen * 0.2 // Also scale width slightly
          }
        } else if (modelRef.current) {
          // If no mouth morph found, try to scale the entire model slightly
          // This is a last resort fallback - make it more visible
          const scale = 1.0 + (mouthOpen - 0.5) * 0.1 // Increased from 0.05 to 0.1
          modelRef.current.scale.y = scale
          modelRef.current.scale.x = 1.0 + (mouthOpen - 0.5) * 0.05
        }
      } else if (mouthMorphRef.current) {
        // Close mouth when not speaking
        const { mesh, index } = mouthMorphRef.current
        if (mesh.morphTargetInfluences && index !== undefined) {
          mesh.morphTargetInfluences[index] = 0
        } else if (mesh.scale) {
          mesh.scale.y = 0.1
        }
      } else if (modelRef.current && !currentIsSpeaking) {
        // Reset model scale when not speaking
        modelRef.current.scale.y = 1.0
      }

      // Eye tracking - look at mouse position
      // Note: Eye tracking works alongside orbit controls - they don't conflict
      if (currentMousePosition && modelRef.current) {
        const lookAtX = currentMousePosition.x * 0.2 // Reduced from 0.3 to be less intrusive
        const lookAtY = currentMousePosition.y * 0.15 // Reduced from 0.2
        
        // Rotate head slightly to follow cursor (subtle, won't interfere with controls)
        if (modelRef.current.rotation) {
          // Only apply if not being manually rotated by user
          // We'll apply a subtle rotation that doesn't conflict with orbit controls
          const baseRotationY = modelRef.current.rotation.y
          modelRef.current.rotation.y = baseRotationY * 0.9 + lookAtX * 0.1
          
          // Limit vertical rotation
          if (modelRef.current.rotation.x !== undefined) {
            modelRef.current.rotation.x = Math.max(-0.2, Math.min(0.2, -lookAtY))
          }
        }
        
        // Move eyes if available (subtle eye movement)
        if (eyeLeftRef.current && eyeLeftRef.current.position) {
          eyeLeftRef.current.position.x += (lookAtX * 0.005 - eyeLeftRef.current.position.x) * 0.1
          eyeLeftRef.current.position.y += (lookAtY * 0.005 - eyeLeftRef.current.position.y) * 0.1
        }
        if (eyeRightRef.current && eyeRightRef.current.position) {
          eyeRightRef.current.position.x += (lookAtX * 0.005 - eyeRightRef.current.position.x) * 0.1
          eyeRightRef.current.position.y += (lookAtY * 0.005 - eyeRightRef.current.position.y) * 0.1
        }
      }

      // Emotion-based expression (simplified - adjust mouth/eyes based on emotion)
      if (currentEmotion === 'happy' && mouthMorphRef.current) {
        // Slight smile - adjust mouth corners if available
        const { mesh } = mouthMorphRef.current
        if (mesh.morphTargetDictionary) {
          const smileIndex = mesh.morphTargetDictionary['smile'] || mesh.morphTargetDictionary['Smile']
          if (smileIndex !== undefined && mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences[smileIndex] = 0.5
          }
        }
      } else if (currentEmotion === 'sad' && mouthMorphRef.current) {
        // Slight frown
        const { mesh } = mouthMorphRef.current
        if (mesh.morphTargetDictionary) {
          const frownIndex = mesh.morphTargetDictionary['frown'] || mesh.morphTargetDictionary['Frown']
          if (frownIndex !== undefined && mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences[frownIndex] = 0.5
          }
        }
      }

      // Idle animation when not speaking (very subtle)
      if (modelRef.current && !currentIsSpeaking) {
        // Very subtle idle rotation - won't interfere with user controls
        modelRef.current.rotation.y += 0.0005
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Update animations when props change
  useEffect(() => {
    // Mouth animation updates are handled in the animation loop
  }, [audioVolume, isSpeaking, mousePosition, emotion])

  // Debug: Log when component mounts and when props change
  useEffect(() => {
    console.log('🎭 EnhancedThreeJSAvatar mounted/updated:', {
      isSpeaking,
      audioVolume,
      hasModel: !!modelRef.current,
      hasMouthMorph: !!mouthMorphRef.current
    })
  }, [isSpeaking, audioVolume])

  return (
    <div ref={mountRef} className="avatar-3d-container">
      <div className="avatar-controls-hint">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
      {/* Debug info overlay - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div>Speaking: {isSpeaking ? '✅' : '❌'}</div>
          <div>Volume: {audioVolume.toFixed(2)}</div>
          <div>Model: {modelRef.current ? '✅' : '❌'}</div>
          <div>Mouth: {mouthMorphRef.current ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  )
}

// Enhanced placeholder avatar with eye tracking support
function createPlaceholderAvatar(scene, modelRef, mouthMorphRef, eyeLeftRef, eyeRightRef) {
  const group = new THREE.Group()
  
  // Head
  const headGeometry = new THREE.SphereGeometry(0.3, 32, 32)
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.set(0, 1.6, 0)
  group.add(head)

  // Eyes (trackable)
  const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16)
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-0.1, 1.65, 0.25)
  group.add(leftEye)
  eyeLeftRef.current = leftEye

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(0.1, 1.65, 0.25)
  group.add(rightEye)
  eyeRightRef.current = rightEye

  // Mouth (animatable) - make it more visible
  const mouthGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.02)
  const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 })
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial)
  mouth.position.set(0, 1.5, 0.25)
  group.add(mouth)

  scene.add(group)
  
  modelRef.current = group
  mouthMorphRef.current = {
    mesh: mouth,
    index: undefined, // No morph target, will use scale
    scaleY: 0.1 // Initial scale
  }
  
  console.log('Placeholder avatar created with animatable mouth')
}

export default Avatar3D
