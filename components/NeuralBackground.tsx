import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NeuralBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    mountRef.current.appendChild(renderer.domElement);

    // Particles - Increased count for better coverage
    const particleCount = 350; 
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const connectionsGeometry = new THREE.BufferGeometry();
    
    // Initialize random positions
    // Spread them out more to fill the screen
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 250; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 150; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // Z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material for Dots - Reduced Opacity for Readability
    const material = new THREE.PointsMaterial({
      color: 0x10b981, // Emerald 500
      size: 1.0,
      transparent: true,
      opacity: 0.6, // Lowered opacity
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Line Material - Lowered Opacity
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.1, // Very subtle lines
    });

    const linesMesh = new THREE.LineSegments(connectionsGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse Interaction Variables
    let mouseX = 0;
    let mouseY = 0;
    
    // For smooth rotation
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.0005; // Reduced sensitivity
      mouseY = (event.clientY - window.innerHeight / 2) * 0.0005;
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    // Animation Loop
    const animate = () => {
      if (!mountRef.current) return;
      requestAnimationFrame(animate);

      // Auto Rotation (Time based) + Mouse Interaction
      targetRotationY += 0.0008; // Constant slow rotation
      targetRotationX = mouseY * 0.5;

      // Smooth interpolation for mouse effect overlaying auto-rotation
      currentRotationY += (targetRotationY + mouseX * 10 - currentRotationY) * 0.05;
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;

      particles.rotation.y = currentRotationY;
      particles.rotation.x = currentRotationX;
      
      linesMesh.rotation.y = particles.rotation.y;
      linesMesh.rotation.x = particles.rotation.x;

      // Dynamic Connections
      const particlePositions = particles.geometry.attributes.position.array as Float32Array;
      const linePositions: number[] = [];
      
      let numConnected = 0;

      for (let i = 0; i < particleCount; i++) {
        if (numConnected > 600) break; // Reduced max connections

        const x1 = particlePositions[i * 3];
        const y1 = particlePositions[i * 3 + 1];
        const z1 = particlePositions[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const x2 = particlePositions[j * 3];
          const y2 = particlePositions[j * 3 + 1];
          const z2 = particlePositions[j * 3 + 2];

          const distSq = (x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2;

          // Increased distance slightly since density is lower, to ensure some connections
          if (distSq < 900) { 
             linePositions.push(x1, y1, z1);
             linePositions.push(x2, y2, z2);
             numConnected++;
          }
        }
      }

      connectionsGeometry.setAttribute(
        'position', 
        new THREE.Float32BufferAttribute(linePositions, 3)
      );

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);
      if (mountRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        mountRef.current.innerHTML = '';
      }
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60" // Reduced global opacity of canvas
      style={{ background: 'transparent' }}
    />
  );
};

export default NeuralBackground;
