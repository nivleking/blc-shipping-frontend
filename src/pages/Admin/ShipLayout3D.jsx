import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Environment, Stats } from "@react-three/drei";
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

// Container component
const ContainerSlot = ({ position, size, color = "#3b82f6", opacity = 0.6, label, highlighted, containerId, onClick }) => {
  const geometry = useMemo(() => new THREE.BoxGeometry(size.width, size.height, size.depth), [size]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: highlighted ? "#059669" : color,
        transparent: true,
        opacity: highlighted ? 0.4 : opacity,
        metalness: 0.8,
        roughness: 0.4,
      }),
    [color, opacity, highlighted]
  );

  return (
    <mesh position={position} geometry={geometry} material={material} castShadow receiveShadow onClick={onClick}>
      {label && (
        <Text position={[0, 0, size.depth / 2 + 0.1]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
          {label}
        </Text>
      )}
    </mesh>
  );
};

// Simplified Sky component
const Sky = () => {
  return (
    <mesh>
      <sphereGeometry args={[1000, 32, 16]} />
      <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
    </mesh>
  );
};

const ShipLayout3D = ({ baySize = { rows: 4, columns: 4 }, bayCount = 1 }) => {
  const [activeExample, setActiveExample] = useState("none");
  const [showContainerIds, setShowContainerIds] = useState(false);

  // Ship dimensions - make the ship longer for more realistic proportions
  const shipLength = bayCount * 15 + 15; // Longer ship
  const shipWidth = baySize.columns * 5 + 2; // Wider to accommodate container columns
  const shipHeight = 7; // Taller hull
  const deckHeight = 0; // Position of the deck above waterline

  // Camera position adjusted to show entire ship
  const cameraPosition = useMemo(() => [shipLength / 7, shipHeight * 1.5, shipWidth * 2.4], [shipLength, shipWidth, shipHeight]);

  // Ship Hull component with more realistic shape
  const ShipHull = () => {
    return (
      <group>
        {/* Main hull */}
        <mesh position={[0, -shipHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[shipLength * 0.95, shipHeight, shipWidth]} />
          <meshPhysicalMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Stern (rear) */}
        <mesh position={[-shipLength * 0.42, -shipHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[shipLength * 0.1, shipHeight, shipWidth * 0.8]} />
          <meshPhysicalMaterial color="#2c3e50" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Deck */}
        <mesh position={[0, deckHeight, 0]} receiveShadow>
          <boxGeometry args={[shipLength * 0.85, 0.5, shipWidth]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Bottom of the hull (darker) */}
        <mesh position={[0, -shipHeight, 0]} receiveShadow>
          <boxGeometry args={[shipLength * 0.85, 1, shipWidth]} />
          <meshPhysicalMaterial color="#1e2a3a" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Waterline accent */}
        <mesh position={[0, -shipHeight / 2 + 0.5, 0]} receiveShadow>
          <boxGeometry args={[shipLength * 0.85, 0.3, shipWidth + 0.1]} />
          <meshPhysicalMaterial color="#c0392b" metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
    );
  };

  // Ship superstructure (bridge, etc.)
  const ShipSuperstructure = () => {
    return (
      <group position={[-shipLength * 0.4, deckHeight + 4, 0]}>
        {/* Main bridge structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[shipLength * 0.15, 8, shipWidth * 0.7]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Bridge windows */}
        <mesh position={[0, 3, shipWidth * 0.36 - 0.1]} castShadow>
          <boxGeometry args={[shipLength * 0.14, 1, 0.1]} />
          <meshPhysicalMaterial color="#2980b9" metalness={0.8} roughness={0.2} transparent opacity={0.7} />
        </mesh>

        <mesh position={[0, 3, -shipWidth * 0.36 + 0.1]} castShadow>
          <boxGeometry args={[shipLength * 0.14, 1, 0.1]} />
          <meshPhysicalMaterial color="#2980b9" metalness={0.8} roughness={0.2} transparent opacity={0.7} />
        </mesh>

        {/* Top level of bridge */}
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[shipLength * 0.12, 2, shipWidth * 0.5]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Command/control room */}
        <mesh position={[0, 7, 0]} castShadow receiveShadow>
          <boxGeometry args={[shipLength * 0.08, 2, shipWidth * 0.35]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Radar/antennas */}
        <group position={[0, 9, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>

          <mesh position={[0, 1, 0]} castShadow>
            <boxGeometry args={[1.5, 0.1, 1.5]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
        </group>

        {/* Smokestack/funnel */}
        <group position={[shipLength * 0.001, 11, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1, 1.5, 7, 16]} />
            <meshPhysicalMaterial color="#c0392b" roughness={0.6} />
          </mesh>

          <mesh position={[0, 3.6, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.2, 0.3, 16]} />
            <meshPhysicalMaterial color="#2c3e50" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>

        {/* Life boats - port side */}
        <group position={[-0.5, 1, shipWidth * 0.36]}>
          <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
            <capsuleGeometry args={[0.4, 1.2]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>

          <mesh position={[1.5, 0, 0]} castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
            <capsuleGeometry args={[0.4, 1.2]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
        </group>

        {/* Life boats - starboard side */}
        <group position={[-0.5, 1, -shipWidth * 0.36]}>
          <mesh castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
            <capsuleGeometry args={[0.4, 1.2]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>

          <mesh position={[1.5, 0, 0]} castShadow receiveShadow rotation={[0, Math.PI / 2, 0]}>
            <capsuleGeometry args={[0.4, 1.2]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
        </group>
      </group>
    );
  };

  // Container loading area with simplified row/column selection
  const ContainerArea = () => {
    // State for row/column visualization
    const [highlightMode, setHighlightMode] = useState(null); // 'row', 'column', or null
    const [highlightIndex, setHighlightIndex] = useState(1); // Which row/column to highlight (default to first)

    // Function to generate container ID in correct format with reversed row numbering
    const getContainerId = (bayIndex, row, col) => {
      // Reverse the row number (highest row number at the bottom)
      const reversedRow = baySize.rows - 1 - row;
      return `${bayIndex + 1}${reversedRow}${col}`;
    };

    // Function to determine if a container is highlighted
    const isContainerHighlighted = (row, col) => {
      if (showContainerIds) return true;
      if (highlightMode === "row" && row === highlightIndex) return true;
      if (highlightMode === "column" && col === highlightIndex) return true;
      return false;
    };

    // Function to determine container color based on highlight type
    const getContainerColor = (row, col) => {
      if (highlightMode === "row" && row === highlightIndex) {
        return "#10b981"; // Green for row highlights
      } else if (highlightMode === "column" && col === highlightIndex) {
        return "#6366f1"; // Purple for column highlights
      } else if (showContainerIds) {
        return "#f59e0b"; // Amber for show all IDs
      } else {
        return "#3b82f6"; // Default blue
      }
    };

    // Toggle row highlight mode
    const toggleRowHighlight = () => {
      if (highlightMode === "row") {
        setHighlightMode(null);
      } else {
        setHighlightMode("row");
        setHighlightIndex(1); // Default to first row
      }
    };

    // Toggle column highlight mode
    const toggleColumnHighlight = () => {
      if (highlightMode === "column") {
        setHighlightMode(null);
      } else {
        setHighlightMode("column");
        setHighlightIndex(1); // Default to first column
      }
    };

    // Change which row/column is highlighted
    const changeHighlightIndex = (increment) => {
      if (highlightMode === "row") {
        const newIndex = highlightIndex + increment;
        if (newIndex >= 0 && newIndex < baySize.rows) {
          setHighlightIndex(newIndex);
        }
      } else if (highlightMode === "column") {
        const newIndex = highlightIndex + increment;
        if (newIndex >= 0 && newIndex < baySize.columns) {
          setHighlightIndex(newIndex);
        }
      }
    };

    return (
      <group position={[shipLength * 0.05, deckHeight + 0.5, 0]}>
        {/* Control Buttons - positioned at the top of the container area */}
        <group position={[0, baySize.rows * 2.5 + 5, 0]}>
          {/* Row highlight button */}
          <group position={[-8, 0, 0]}>
            <mesh onClick={toggleRowHighlight} position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 1.5, 1]} />
              <meshStandardMaterial color={highlightMode === "row" ? "#10b981" : "#64748b"} emissive={highlightMode === "row" ? "#10b981" : "#000000"} emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.51]} fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
              {highlightMode === "row" ? "Hide Rows" : "Show Row"}
            </Text>
          </group>

          {/* Column highlight button */}
          <group position={[-4, 0, 0]}>
            <mesh onClick={toggleColumnHighlight} position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 1.5, 1]} />
              <meshStandardMaterial color={highlightMode === "column" ? "#6366f1" : "#64748b"} emissive={highlightMode === "column" ? "#6366f1" : "#000000"} emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0, 0.51]} fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
              {highlightMode === "column" ? "Hide Columns" : "Show Column"}
            </Text>
          </group>

          {/* Navigation buttons - only show when in highlight mode */}
          {highlightMode && (
            <>
              <group position={[0, 0, 0]}>
                <mesh onClick={() => changeHighlightIndex(-1)} position={[0, 0, 0]}>
                  <boxGeometry args={[1.5, 1.5, 1]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
                <Text position={[0, 0, 0.51]} fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
                  {"←"}
                </Text>
              </group>

              <group position={[2, 0, 0]}>
                <mesh onClick={() => changeHighlightIndex(1)} position={[0, 0, 0]}>
                  <boxGeometry args={[1.5, 1.5, 1]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
                <Text position={[0, 0, 0.51]} fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle">
                  {"→"}
                </Text>
              </group>

              <Text position={[5, 0, 0]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle">
                {highlightMode === "row" ? `Row ${baySize.rows - 1 - highlightIndex}` : `Column ${highlightIndex}`}
              </Text>
            </>
          )}

          {/* Current selection indicator */}
          {highlightMode && (
            <Text position={[0, 2, 0]} fontSize={0.8} fontWeight={700} color="#ffffff" anchorX="center" anchorY="middle" backgroundColor="#00000080" padding={0.5}>
              {highlightMode === "row" ? `Showing Row ${baySize.rows - 1 - highlightIndex} across all bays` : `Showing Column ${highlightIndex} across all bays`}
            </Text>
          )}
        </group>

        {Array.from({ length: bayCount }).map((_, bayIndex) => {
          const bayPosition = [bayIndex * 8 - (bayCount - 1) * 2.5, 0, 0];

          return (
            <group key={bayIndex} position={bayPosition}>
              {/* Container Grid with reversed row ID ordering */}
              {Array.from({ length: baySize.rows }).map((_, row) =>
                Array.from({ length: baySize.columns }).map((_, col) => {
                  // Calculate container position - physical layout remains the same
                  const containerId = getContainerId(bayIndex, row, col);
                  // Use new functions to determine highlight state and color
                  const highlighted = isContainerHighlighted(row, col);
                  const containerColor = getContainerColor(row, col);

                  return (
                    <ContainerSlot
                      key={`${bayIndex}-${row}-${col}`}
                      position={[
                        0,
                        row * 2.5 + 1.25, // Starting from the bottom - physical layout unchanged
                        (col - (baySize.columns - 1) / 2) * 4,
                      ]}
                      size={{ width: 5.5, height: 2.5, depth: 2 }}
                      color={containerColor}
                      opacity={0.6}
                      label={highlighted ? containerId : null}
                      highlighted={highlighted}
                      containerId={containerId}
                    />
                  );
                })
              )}

              {/* Bay Label */}
              <Text position={[0, baySize.rows * 2.5 + 3, 0]} fontSize={1} fontWeight={700} color="#ffffff" anchorX="center" anchorY="middle">
                {`Bay ${bayIndex + 1}`}
              </Text>
            </group>
          );
        })}
      </group>
    );
  };

  return (
    <div
      className="relative h-[600px] w-full"
      style={{
        background: "linear-gradient(to bottom, #87CEEB, #1E90FF)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas shadows gl={{ antialias: true, alpha: false }} camera={{ position: cameraPosition, fov: 90 }} dpr={[1, 5]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 30, 10]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minPolarAngle={Math.PI / 10} maxPolarAngle={Math.PI / 2.1} dampingFactor={0.05} enableDamping={true} minDistance={5} maxDistance={100} />

        {/* Simple sky background */}
        <Sky />
        <Ocean size={500} />

        {/* Ship components */}
        <group position={[0, 1, 0]}>
          <ShipHull />
          <ShipSuperstructure />
          <ContainerArea />
        </group>

        <Environment preset="sunset" />
        {/* <Stats /> */}
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 bg-black/60 p-4 rounded-lg text-white">
        <button onClick={() => setShowContainerIds(!showContainerIds)} className={`px-3 py-1 rounded text-sm ${showContainerIds ? "bg-blue-600" : "bg-gray-600"}`}>
          {showContainerIds ? "Hide All IDs" : "Show All IDs"}
        </button>

        <div className="mt-2 text-xs">
          <div>🖱️ Left click + drag: Rotate view</div>
          <div>🖱️ Right click + drag: Pan view</div>
          <div>🖱️ Scroll: Zoom in/out</div>
          <div>🖱️ Click R#: Highlight row</div>
          <div>🖱️ Click C#: Highlight column</div>
        </div>
      </div>
    </div>
  );
};

export default ShipLayout3D;
