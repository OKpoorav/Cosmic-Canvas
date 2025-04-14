import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styled from 'styled-components';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PlanetContainer = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  canvas {
    width: 100% !important;
    height: 100% !important;
    background: transparent;
  }
`;

const Planet3D = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Planet geometry and material
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 purple = vec3(0.4, 0.2, 0.6);
          vec3 blue = vec3(0.2, 0.4, 0.8);
          
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 color = mix(purple, blue, fresnel);
          
          // Add time-based patterns
          float pattern = sin(vPosition.x * 5.0 + time) * sin(vPosition.y * 5.0 + time) * sin(vPosition.z * 5.0 + time);
          color += vec3(0.3, 0.4, 1.0) * pattern * 0.2;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.7, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphereColor = vec3(0.4, 0.2, 0.8) * intensity;
          gl_FragColor = vec4(atmosphereColor, intensity * 0.5);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6441a5, 2);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Animation
    let time = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);

      time += 0.01;
      material.uniforms.time.value = time;
      atmosphereMaterial.uniforms.time.value = time;

      planet.rotation.y += 0.002;
      atmosphere.rotation.y += 0.001;

      controls.update();
      renderer.render(scene, camera);

      return () => {
        cancelAnimationFrame(animationId);
      };
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      atmosphereMaterial.dispose();
      atmosphereGeometry.dispose();
    };
  }, []);

  return <PlanetContainer ref={mountRef} />;
};

export default Planet3D; 