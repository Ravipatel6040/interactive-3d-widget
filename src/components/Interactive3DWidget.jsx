import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

// Utility function to check if the browser supports WebGL
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    // Check if WebGLRenderingContext exists and can create a context
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
};

const Interactive3DWidget = () => {
  const containerRef = useRef(null); // Reference to the div container for Three.js canvas
  const rendererRef = useRef(null); // Reference to the WebGL renderer instance
  const rotationSpeedRef = useRef(0.01); // Rotation speed, mutable without rerendering

  const [isLoading, setIsLoading] = useState(true); // Loading state for showing spinner
  const [webglSupported, setWebglSupported] = useState(true); // WebGL support flag
  const [, forceUpdate] = useState(0); // Force update to trigger React render when speed changes

  useEffect(() => {
    // Check WebGL support on mount, disable if not supported
    if (!isWebGLAvailable()) {
      setWebglSupported(false);
      return;
    }

    // Get container DOM element for rendering the scene
    const container = containerRef.current;

    // Create a new Three.js scene
    const scene = new THREE.Scene();

    // Set up perspective camera
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      container.clientWidth / container.clientHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.z = 5; // Position camera away from the origin

    // Create WebGL renderer with alpha for transparency and antialias for smooth edges
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight); // Match container size
    renderer.setPixelRatio(window.devicePixelRatio); // Handle high-DPI screens
    renderer.shadowMap.enabled = true; // Enable shadows in renderer
    container.appendChild(renderer.domElement); // Add canvas to the DOM
    rendererRef.current = renderer; // Save renderer reference for cleanup

    // Add ambient light to the scene (soft overall light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light to simulate sunlight and cast shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 5, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load texture for the cube (wood texture)
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/Wood.jpg"); // Make sure Wood.jpg is in /public folder

    // Create a box geometry and apply the wood texture material
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true; // Enable shadow casting for the cube
    scene.add(cube);

    // Create a large plane to act as floor and receive shadows
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShadowMaterial({ opacity: 0.2 }) // Transparent shadow material
    );
    floor.rotation.x = -Math.PI / 2; // Rotate to lay flat
    floor.position.y = -2; // Position below the cube
    floor.receiveShadow = true; // Enable shadow receiving
    scene.add(floor);

    // Variables for drag rotation control
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };

    // Mouse event handlers for drag rotation
    const onMouseDown = (e) => {
      isDragging = true;
      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      // Calculate movement delta
      const deltaX = e.clientX - previousPointerPosition.x;
      const deltaY = e.clientY - previousPointerPosition.y;
      // Rotate cube based on drag movement
      cube.rotation.y += deltaX * 0.01;
      cube.rotation.x += deltaY * 0.01;
      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    // Touch event handlers for drag rotation on mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        const touch = e.touches[0];
        previousPointerPosition = { x: touch.clientX, y: touch.clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - previousPointerPosition.x;
      const deltaY = touch.clientY - previousPointerPosition.y;
      cube.rotation.y += deltaX * 0.01;
      cube.rotation.x += deltaY * 0.01;
      previousPointerPosition = { x: touch.clientX, y: touch.clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    // Attach mouse event listeners to container
    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseUp);

    // Attach touch event listeners to container
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);

    // Handle window resize to update camera and renderer size
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation loop to continuously render the scene and rotate cube
    const animate = () => {
      cube.rotation.y += rotationSpeedRef.current; // Auto rotate around Y-axis
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Delay start to simulate loading and then start animation
    setTimeout(() => {
      setIsLoading(false);
      animate();
    }, 500);

    // Cleanup function to remove event listeners and dispose of Three.js objects
    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseUp);

      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);

      window.removeEventListener("resize", onResize);

      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Handler to update rotation speed from the slider input
  const onSpeedChange = (e) => {
    rotationSpeedRef.current = parseFloat(e.target.value);
    forceUpdate((v) => v + 1); // Trigger re-render to update UI display
  };

  // If WebGL is not supported, show fallback message and image
  if (!webglSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-700">
        <p className="text-lg font-semibold">Your browser does not support WebGL.</p>
        <img src="/fallback.png" alt="Fallback" className="mt-4 max-w-xs" />
      </div>
    );
  }

  return (
    <div className="max-w-full w-full flex flex-col items-center p-4">
      {/* Container for Three.js canvas */}
      <div
        ref={containerRef}
        className="w-full max-w-3xl aspect-[3/2] rounded-lg shadow-lg bg-gray-50 relative touch-none"
      >
        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {/* Rotation speed control slider */}
      <div className="mt-6 w-full max-w-3xl px-2 flex flex-col sm:flex-row items-center justify-between">
        <label className="text-gray-700 font-medium mb-2 sm:mb-0 flex items-center">
          Rotation Speed:
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={rotationSpeedRef.current}
            onChange={onSpeedChange}
            className="ml-3 w-full sm:w-64 cursor-pointer accent-blue-600"
          />
        </label>
        {/* Display the current rotation speed with 3 decimal places */}
        <span className="ml-0 sm:ml-4 text-gray-600 font-semibold">
          {rotationSpeedRef.current.toFixed(3)}
        </span>
      </div>
    </div>
  );
};

export default Interactive3DWidget;
