import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useState, useMemo } from "react";

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

  // Updated container ID calculation to match RenderShipBayLayout format
  // Format: bay + row + col (e.g., 102 means bay 1, row 0, column 2)
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
  // Update highlight color to be more solid and visible
  const highlightColor = "#059669"; // Using a more solid green color
  const defaultColor = "#3b82f6";

  return (
    <group position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <ContainerSlot
        position={[0, 0, 0]}
        size={size}
        color={highlighted ? highlightColor : defaultColor}
        opacity={highlighted ? 0.9 : hovered ? 0.8 : 0.6} // Increased opacity for highlighted state
        label={label}
        baySize={baySize}
      />
    </group>
  );
};

const ShipLayout3D = ({ baySize = { rows: 4, columns: 6 }, bayCount = 3 }) => {
  const [activeExample, setActiveExample] = useState("none");
  const [showContainerIds, setShowContainerIds] = useState(false);

  return (
    <div className="relative h-[600px]" style={{ background: "linear-gradient(to bottom, #f8fafc, #e2e8f0)" }}>
      <Canvas shadows gl={{ antialias: true }} camera={{ position: [15, 12, 15], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#f8fafc"]} />
        <fog attach="fog" args={["#f8fafc", 30, 40]} />

        {/* Improved Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <pointLight position={[-10, 8, -10]} intensity={0.4} />

        {/* Updated OrbitControls with zoom limits */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          dampingFactor={0.05}
          enableDamping={true}
          minDistance={5} // Minimum zoom distance
          maxDistance={30} // Maximum zoom distance
        />

        {/* Ship Base with better materials */}
        <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
          <boxGeometry args={[bayCount * 4 + 2, 0.5, baySize.columns * 1.2 + 2]} />
          <meshPhysicalMaterial color="#475569" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Enhanced Bays */}
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
                    opacity={0.15}
                    showId={showContainerIds}
                    row={row}
                    col={col}
                    bayIndex={bayIndex}
                    baySize={baySize}
                  />
                ))
              )}

              {/* Enhanced Highlight Examples */}
              {activeExample === "row" && (
                <BaySection
                  position={[0, 1, 0]}
                  size={{ width: 3, height: 0.9, depth: baySize.columns * 0.9 }}
                  highlighted={true}
                  label="Row Example"
                  baySize={baySize} // Add this line
                />
              )}

              {activeExample === "column" && (
                <BaySection
                  position={[0, baySize.rows / 2, 0]}
                  size={{ width: 3, height: baySize.rows, depth: 0.9 }}
                  highlighted={true}
                  label="Column Example"
                  baySize={baySize} // Add this line
                />
              )}

              {/* Enhanced Bay Label */}
              <Text position={[0, baySize.rows + 0.5, 0]} fontSize={0.8} color="#1e293b" anchorX="center" anchorY="middle">
                {`Bay ${bayIndex + 1}`}
              </Text>
            </group>
          );
        })}

        <Environment preset="city" />
      </Canvas>

      {/* Enhanced Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => setActiveExample(activeExample === "row" ? "none" : "row")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeExample === "row" ? "bg-emerald-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          Show Row
        </button>
        <button
          onClick={() => setActiveExample(activeExample === "column" ? "none" : "column")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeExample === "column" ? "bg-emerald-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          Show Column
        </button>
        <button
          onClick={() => setShowContainerIds(!showContainerIds)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${showContainerIds ? "bg-blue-600 text-white shadow-lg" : "bg-white/90 border border-gray-200 hover:bg-gray-50"}`}
        >
          {showContainerIds ? "Hide IDs" : "Show IDs"}
        </button>
      </div>

      {/* Enhanced Instructions */}
      <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-lg shadow-lg text-sm space-y-2">
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
