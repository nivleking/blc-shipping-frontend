import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Text, Environment, Stats, GradientTexture } from "@react-three/drei";
import * as THREE from "three";
import { useState, useMemo, useRef } from "react";

// Ocean component for realistic water
const Ocean = ({ size = 1000 }) => {
  const ref = useRef();
  const waterGeometry = useMemo(() => new THREE.PlaneGeometry(size, size, 32, 32), [size]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.material.uniforms.time.value = time * 0.5;
    }
  });

  // Custom water material with animated waves
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("#0077be") },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Simple wave effect
          pos.z += sin(pos.x * 2.0 + time) * 2.0;
          pos.z += cos(pos.y * 2.0 + time) * 2.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          // Add gradient and darker near edges
          float depth = 0.5 + 0.5 * cos(vUv.x * 3.14159) * sin(vUv.y * 3.14159);
          vec3 waterColor = mix(color, color * 0.5, depth);
          gl_FragColor = vec4(waterColor, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  return <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} geometry={waterGeometry} material={waterMaterial} receiveShadow />;
};

const ContainerSlot = ({ position, size, color = "#3b82f6", opacity = 0.6, label, showId, row, col, bayIndex, baySize }) => {
  const geometry = useMemo(() => new THREE.BoxGeometry(size.width, size.height, size.depth), [size]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity,
        metalness: 0.5,
        roughness: 0.2,
        side: THREE.DoubleSide,
      }),
    [color, opacity]
  );

  if (!baySize) return null;

  const containerId = `${bayIndex + 1}${baySize.rows - row - 1}${col}`;

  return (
    <mesh position={position} geometry={geometry} material={material} castShadow receiveShadow>
      {(label || showId) && (
        <Text position={[0, size.height / 2 + 0.2, 0]} fontSize={0.3} color="#1e293b" anchorX="center" anchorY="middle">
          {label || containerId}
        </Text>
      )}
    </mesh>
  );
};

const BaySection = ({ position, size, highlighted, label, baySize }) => {
  const [hovered, setHovered] = useState(false);
  const highlightColor = "#059669";
  const defaultColor = "#3b82f6";

  if (!position || !size || !baySize) return null;

  return (
    <group position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <ContainerSlot position={[0, 0, 0]} size={size} color={highlighted ? highlightColor : defaultColor} opacity={0.5} label={label} baySize={baySize} row={0} col={0} bayIndex={0} />
    </group>
  );
};

// Sky component with realistic gradient
const Sky = () => {
  return (
    <mesh position={[0, 0, -500]} rotation={[0, 0, 0]}>
      <planeGeometry args={[2000, 1000]} />
      <meshBasicMaterial>
        <GradientTexture attach="map" stops={[0, 0.3, 0.6, 1]} colors={["#87ceeb", "#6698cb", "#4682b4", "#87CEFA"]} />
      </meshBasicMaterial>
    </mesh>
  );
};

const ShipLayout3D = ({ baySize = { rows: 4, columns: 6 }, bayCount = 3 }) => {
  const [activeExample, setActiveExample] = useState("none");
  const [showContainerIds, setShowContainerIds] = useState(false);

  // Adjusted camera position to see ship from better angle with water
  const cameraPosition = useMemo(() => {
    const x = Math.max(15, bayCount * 4);
    const y = Math.max(14, baySize.rows * 2.5); // Slightly higher to see ocean
    const z = Math.max(15, baySize.columns * 2);
    return [x, y, z];
  }, [bayCount, baySize]);

  const ShipDetails = () => {
    return (
      <group>
        {/* Bridge/Command structure with multiple levels */}
        <group position={[bayCount * 2 - 4, 0, 0]}>
          {/* Main bridge structure */}
          <mesh castShadow>
            <boxGeometry args={[5, 8, baySize.columns * 0.9]} />
            <meshPhysicalMaterial color="#2c3e50" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Bridge windows */}
          <mesh position={[0, 5, baySize.columns * 0.46]}>
            <boxGeometry args={[4.5, 1.5, 0.1]} />
            <meshPhysicalMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
          </mesh>

          {/* Bridge top level */}
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[4, 2, baySize.columns * 0.7]} />
            <meshPhysicalMaterial color="#3b4252" metalness={0.5} roughness={0.3} />
          </mesh>

          {/* Control room */}
          <mesh position={[-0.5, 7.5, 0]}>
            <boxGeometry args={[3, 1.5, baySize.columns * 0.5]} />
            <meshPhysicalMaterial color="#2c3e50" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>

        {/* Improved funnel/smokestack with details */}
        <group position={[bayCount * 2 - 4, 8.5, 0]}>
          {/* Main funnel */}
          <mesh castShadow>
            <cylinderGeometry args={[1.2, 1.6, 5, 16]} />
            <meshPhysicalMaterial color="#e63946" roughness={0.3} />
          </mesh>

          {/* Funnel top rim */}
          <mesh position={[0, 2.6, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 0.3, 16]} />
            <meshPhysicalMaterial color="#333333" metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Company logo/marking on funnel */}
          <mesh position={[0, 1, 1.3]} rotation={[0, 0, 0]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </group>

        {/* Navigation equipment */}
        <group position={[bayCount * 2 - 3, 9, 0]}>
          {/* Radar/satellite equipment */}
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#888888" />
          </mesh>

          <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        </group>

        {/* Deck equipment */}
        <mesh position={[bayCount * 2 - 6, 0.5, 0]} castShadow>
          <boxGeometry args={[2, 1, baySize.columns * 0.3]} />
          <meshPhysicalMaterial color="#607d8b" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Life boats (simplified) */}
        <mesh position={[bayCount * 2 - 6, 1.5, baySize.columns * 0.3]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 2, 8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        <mesh position={[bayCount * 2 - 6, 1.5, -baySize.columns * 0.3]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 2, 8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>
    );
  };

  return (
    <div
      className="relative h-[500px] w-full"
      style={{
        background: "linear-gradient(to bottom, #87CEEB, #1E90FF)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas shadows gl={{ antialias: true, alpha: false }} camera={{ position: cameraPosition, fov: 45 }} dpr={[1, 2]} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        {/* Sky blue background */}
        <color attach="background" args={["#87CEEB"]} />

        {/* Lighting for better scene visibility */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <pointLight position={[-10, 8, -10]} intensity={0.4} />

        {/* Controls - FIXED: removed the addEventListener prop that caused errors */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} dampingFactor={0.05} enableDamping={true} minDistance={5} maxDistance={30} />

        {/* Add sky for better atmosphere */}
        <Sky />

        {/* Ocean surface */}
        <Ocean size={200} />

        {/* Ship base */}
        <mesh position={[0, -2, 0]} receiveShadow castShadow>
          <boxGeometry args={[bayCount * 4 + 4, 3, baySize.columns * 1.2 + 4]} />
          <meshPhysicalMaterial color="#475569" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* <ShipDetails /> */}

        {/* Enhanced Bays - raised position to sit on water */}
        <group position={[0, 1, 0]}>
          {Array.from({ length: bayCount }).map((_, bayIndex) => {
            const bayPosition = [bayIndex * 4 - (bayCount - 1) * 2, 0, 0];

            return (
              <group key={bayIndex} position={bayPosition}>
                {/* Container Grid with IDs */}
                {Array.from({ length: baySize.rows }).map((_, row) =>
                  Array.from({ length: baySize.columns }).map((_, col) => (
                    <ContainerSlot
                      key={`${row}-${col}`}
                      position={[0, row, col - baySize.columns / 2 + 0.5]}
                      size={{ width: 3, height: 0.9, depth: 0.9 }}
                      color="#94a3b8"
                      opacity={0.2} // Slightly more visible
                      showId={showContainerIds}
                      row={row}
                      col={col}
                      bayIndex={bayIndex}
                      baySize={baySize}
                    />
                  ))
                )}

                {/* Examples */}
                {activeExample === "row" && <BaySection position={[0, 1, 0]} size={{ width: 3, height: 0.9, depth: baySize.columns * 0.9 }} highlighted={true} label="Row Example" baySize={baySize} />}

                {activeExample === "column" && <BaySection position={[0, baySize.rows / 2, 0]} size={{ width: 3, height: baySize.rows, depth: 0.9 }} highlighted={true} label="Column Example" baySize={baySize} />}

                {/* Bay Label */}
                <Text position={[0, baySize.rows + 0.5, 0]} fontSize={0.8} color="#1e293b" anchorX="center" anchorY="middle">
                  {`Bay ${bayIndex + 1}`}
                </Text>
              </group>
            );
          })}
        </group>

        <Environment preset="sunset" />
        <Stats />
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => setActiveExample(activeExample === "row" ? "none" : "row")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeExample === "row" ? "bg-emerald-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          Show Row
        </button>
        <button
          onClick={() => setActiveExample(activeExample === "column" ? "none" : "column")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeExample === "column" ? "bg-emerald-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          Show Column
        </button>
        <button
          onClick={() => setShowContainerIds(!showContainerIds)}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${showContainerIds ? "bg-blue-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          {showContainerIds ? "Hide IDs" : "Show IDs"}
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-lg shadow-lg text-xs space-y-2">
        <p className="flex items-center gap-2">
          🖱️ <span className="text-gray-700">Left click + drag to rotate</span>
        </p>
        <p className="flex items-center gap-2">
          🖱️ <span className="text-gray-700">Right click + drag to pan</span>
        </p>
        <p className="flex items-center gap-2">
          🖱️ <span className="text-gray-700">Scroll to zoom</span>
        </p>
      </div>
    </div>
  );
};

export default ShipLayout3D;
