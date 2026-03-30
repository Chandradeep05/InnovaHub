import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x14b8a6, 2.5, 100);
    pointLight1.position.set(15, 10, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 100);
    pointLight2.position.set(-15, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 1.5, 80);
    pointLight3.position.set(0, 15, -10);
    scene.add(pointLight3);

    // Materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6, metalness: 0.1, roughness: 0.1,
      transmission: 0.9, thickness: 0.5, ior: 1.5,
      transparent: true, opacity: 0.7,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, metalness: 0.8, roughness: 0.2,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.15,
    });

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0x14b8a6, emissive: 0x14b8a6, emissiveIntensity: 0.3,
      metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.8,
    });

    // Objects
    const objects = [];

    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(2.5, 0.6, 128, 32), glassMaterial);
    torusKnot.position.set(12, 5, -10);
    scene.add(torusKnot);
    objects.push({ mesh: torusKnot, speedX: 0.003, speedY: 0.005, floatSpeed: 0.8, floatAmplitude: 1.5 });

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 0), metalMaterial);
    icosahedron.position.set(-13, -3, -8);
    scene.add(icosahedron);
    objects.push({ mesh: icosahedron, speedX: 0.004, speedY: 0.006, floatSpeed: 1.1, floatAmplitude: 1.2 });

    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), glowMaterial);
    octahedron.position.set(8, -6, -5);
    scene.add(octahedron);
    objects.push({ mesh: octahedron, speedX: 0.005, speedY: 0.003, floatSpeed: 1.3, floatAmplitude: 1 });

    const wireframeSphere = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), wireframeMaterial);
    wireframeSphere.position.set(-8, 8, -15);
    scene.add(wireframeSphere);
    objects.push({ mesh: wireframeSphere, speedX: 0.001, speedY: 0.002, floatSpeed: 0.5, floatAmplitude: 0.8 });

    const dodecahedron = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 0),
      new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3, emissive: 0xf59e0b, emissiveIntensity: 0.1 })
    );
    dodecahedron.position.set(-5, -8, -6);
    scene.add(dodecahedron);
    objects.push({ mesh: dodecahedron, speedX: 0.006, speedY: 0.004, floatSpeed: 1.0, floatAmplitude: 1.3 });

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.3, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.2, emissive: 0x06b6d4, emissiveIntensity: 0.15 })
    );
    torus.position.set(15, -10, -12);
    scene.add(torus);
    objects.push({ mesh: torus, speedX: 0.007, speedY: 0.005, floatSpeed: 0.9, floatAmplitude: 1.1 });

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 2.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.5, roughness: 0.3, emissive: 0x8b5cf6, emissiveIntensity: 0.1 })
    );
    cone.position.set(-15, 5, -7);
    scene.add(cone);
    objects.push({ mesh: cone, speedX: 0.004, speedY: 0.006, floatSpeed: 1.2, floatAmplitude: 0.9 });

    // Scattered cubes
    for (let i = 0; i < 8; i++) {
      const size = Math.random() * 0.5 + 0.3;
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.45 + Math.random() * 0.3, 0.7, 0.5),
          metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.6,
        })
      );
      cube.position.set((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 20 - 5);
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(cube);
      objects.push({
        mesh: cube,
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: Math.random() * 0.5 + 0.5,
        floatAmplitude: Math.random() * 0.5 + 0.3,
      });
    }

    // Particles
    const particleCount = 1200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: 0x4a5568, size: 0.08, transparent: true, opacity: 0.6, sizeAttenuation: true })
    );
    scene.add(particles);

    // Mouse tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      objects.forEach((obj, i) => {
        obj.mesh.rotation.x += obj.speedX;
        obj.mesh.rotation.y += obj.speedY;
        obj.mesh.position.y += Math.sin(elapsed * obj.floatSpeed + i) * 0.005 * obj.floatAmplitude;
        const depth = Math.abs(obj.mesh.position.z);
        const parallaxStrength = Math.max(0.05, 1 - depth / 30);
        obj.mesh.position.x += mouse.x * parallaxStrength * 0.02;
        obj.mesh.position.y -= mouse.y * parallaxStrength * 0.02;
      });

      pointLight1.position.x = Math.sin(elapsed * 0.3) * 15;
      pointLight1.position.y = Math.cos(elapsed * 0.2) * 10;
      pointLight2.position.x = Math.cos(elapsed * 0.4) * 15;
      pointLight2.position.y = Math.sin(elapsed * 0.3) * 10;
      pointLight3.position.z = Math.sin(elapsed * 0.2) * 10;

      const hue1 = (elapsed * 0.02) % 1;
      const hue2 = (elapsed * 0.02 + 0.33) % 1;
      pointLight1.color.setHSL(hue1, 0.8, 0.5);
      pointLight2.color.setHSL(hue2, 0.7, 0.4);

      particles.rotation.y += 0.0002;
      particles.rotation.x += 0.0001;

      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="three-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeBackground;
