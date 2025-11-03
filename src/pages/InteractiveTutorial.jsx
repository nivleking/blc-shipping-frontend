import React, { useState, useMemo, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Link } from "react-router-dom";
import ContainerBay from "../components/simulations/stowages/ContainerBay";
import ContainerDock from "../components/simulations/stowages/ContainerDock";
import DroppableCell from "../components/simulations/stowages/DroppableCell";
import DraggableContainer from "../components/simulations/stowages/DraggableContainer";
import GuideModal from "./Admin/GuideModal";

// Port colors
const PORT_COLORS = {
  SBY: "red", // red
  MKS: "blue", // blue
  MDN: "green", // green
  JYP: "yellow", // yellow
  BPN: "black", // black
};

const getPortColor = (port) => {
  return PORT_COLORS[port] || "#383b40ff";
};

const formatIDR = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

// Tutorial steps
const TUTORIAL_STEPS = [
  {
    id: 0,
    title: "🎯 Welcome to BLC Shipping!",
    description: "Learn how to manage containers on a cargo ship. This tutorial will guide you step by step.",
    instruction: "Click 'Next' to begin!",
    highlight: null,
    requiredAction: null,
  },
  {
    id: 1,
    title: "🚢 Meet the Ship Bay",
    description: "This is the Ship Bay - where containers are stored on the vessel. It consists of 3 bays with 4 rows x 3 columns each.",
    instruction: "Notice Bay 1 and Bay 2 for DRY containers, Bay 3 for REEFER (refrigerated) containers.",
    highlight: "bay",
    requiredAction: null,
  },
  {
    id: 2,
    title: "📦 Containers in Bay",
    description: "Look! There are 4 containers already arranged in the bay. Each container has a destination code (MDN, BPN, JYP, MKS, SBY).",
    instruction: "Container colors indicate destinations: Green=MDN, Blue=MKS, Yellow=JYP, Red=SBY, Black=BPN",
    highlight: "bay",
    requiredAction: null,
  },
  {
    id: 3,
    title: "🏗️ Meet the Ship Dock",
    description: "This is the Ship Dock - a staging area where new containers appear before being loaded onto the ship.",
    instruction: "There are 4 containers ready to be loaded. Let's try loading them!",
    highlight: "dock",
    requiredAction: null,
  },
  {
    id: 4,
    title: "✋ Try Drag & Drop!",
    description: "Your turn! Drag the green container (MDN) from the dock to Bay 1.",
    instruction: "📍 Click and hold the green container, then drag it to an empty cell in Bay 1. Remember: only bottom row or above other containers!",
    highlight: "container-105",
    requiredAction: "move-105-to-bay",
  },
  {
    id: 5,
    title: "✅ Great! Stacking Rules",
    description: "Excellent! You've loaded your first container. Notice: containers can only be placed in the bottom row or on top of other containers (like stacking boxes in real life).",
    instruction: "This is called the 'Gravity Rule' - no floating containers allowed!",
    highlight: "bay",
    requiredAction: null,
  },
  {
    id: 6,
    title: "🎯 Strategy: Port Order",
    description: "Important tip! Port sequence in this simulation: SBY → MDN → BPN → JYP → MKS.",
    instruction: "Stack containers in this order: Place MKS (last) at BOTTOM, SBY (first) on TOP. This prevents 'Restowage'.",
    highlight: "bay",
    requiredAction: null,
  },
  {
    id: 7,
    title: "⚠️ Restowage Problem",
    description: "Restowage occurs when a container that needs unloading is blocked by containers above it. This adds cost and time!",
    instruction: "Example: If MKS container is below JYP, you must move MKS first at JYP.",
    highlight: "bay",
    requiredAction: null,
  },
  {
    id: 8,
    title: "📋 Sales Call Cards",
    description: "In the actual game, you'll receive new container orders (Sales Calls). You can Accept or Reject them.",
    instruction: "Committed Cards MUST be accepted (high penalty if rejected). Non-Committed can be rejected without penalty.",
    highlight: "sales",
    requiredAction: null,
  },
  {
    id: 9,
    title: "🎮 Practice Mode: Try It!",
    description: "Now it's your practice time! Try arranging all containers from dock to bay with optimal strategy.",
    instruction: "Remember: MKS (blue) at bottom, SBY (red) on top. Try dragging the remaining 3 containers to the bay!",
    highlight: "practice",
    requiredAction: "practice-mode",
  },
  {
    id: 10,
    title: "🎉 Tutorial Complete!",
    description: "Congratulations! You've mastered the basics of BLC Shipping. Ready to play with others?",
    instruction: "Login to join multiplayer rooms and compete on the leaderboard!",
    highlight: null,
    requiredAction: "complete",
  },
];

const InteractiveTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Bay configuration
  const baySize = { rows: 3, columns: 4 };
  const bayCount = 3;
  const bayTypes = ["dry", "dry", "reefer"];
  const dockSize = { rows: 3, columns: 10 };

  // Port sequence for the tutorial
  const portSequence = ["SBY", "MDN", "BPN", "JYP", "MKS"];

  // Add new state for controlling dragging
  const isDraggingAllowed = currentStep >= 4; // Only allow dragging from step 4 onwards

  const TutorialOverlay = ({ step, isVisible, children }) => {
    if (!isVisible || currentStep === 4 || step.requiredAction === "practice-mode") {
      return children;
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" />
        {step.highlight && (
          <div
            className="absolute inset-0 z-20"
            style={{
              background: `radial-gradient(circle at var(--highlight-x) var(--highlight-y), transparent 160px, rgba(0,0,0,0.7) 200px)`,
            }}
          />
        )}
        {children}
      </div>
    );
  };

  // Container definitions with port colors
  const containerDefinitions = [
    { id: 101, destination: "MDN", type: "dry" },
    { id: 102, destination: "BPN", type: "dry" },
    { id: 103, destination: "JYP", type: "dry" },
    { id: 104, destination: "MKS", type: "dry" },
    { id: 105, destination: "MDN", type: "dry" },
    { id: 106, destination: "BPN", type: "dry" },
    { id: 107, destination: "MKS", type: "dry" },
    { id: 108, destination: "SBY", type: "dry" },
  ];

  // Create containers with colors based on destination
  const containers = useMemo(
    () =>
      containerDefinitions.map((def) => ({
        ...def,
        color: getPortColor(def.destination),
      })),
    []
  );

  // Container destinations cache
  const containerDestinationsCache = useMemo(() => {
    const map = {};
    containers.forEach((c) => (map[c.id] = c.destination));
    return map;
  }, [containers]);

  // Initial positions - some in bay, some in dock
  const [droppedItems, setDroppedItems] = useState([
    // Bay initial positions
    { id: 101, area: "bay-0-10", color: getPortColor("MDN"), type: "dry" },
    { id: 102, area: "bay-0-11", color: getPortColor("BPN"), type: "dry" },
    { id: 103, area: "bay-1-10", color: getPortColor("JYP"), type: "dry" },
    { id: 104, area: "bay-1-11", color: getPortColor("MKS"), type: "dry" },

    // Dock initial positions
    { id: 105, area: "docks-1", color: getPortColor("MDN"), type: "dry" },
    { id: 106, area: "docks-2", color: getPortColor("BPN"), type: "dry" },
    { id: 107, area: "docks-3", color: getPortColor("MKS"), type: "dry" },
    { id: 108, area: "docks-4", color: getPortColor("SBY"), type: "dry" },
  ]);

  const [draggingItem, setDraggingItem] = useState(null);
  const [actionCompleted, setActionCompleted] = useState({});

  // Helper functions
  const getRowColFromCellId = (cellId) => {
    const parts = cellId.split("-");
    if (parts[0] !== "bay") return null;
    const cellIndex = parseInt(parts[2], 10);
    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;
    return { bayIndex: parseInt(parts[1], 10), row, col, cellIndex };
  };

  const canPlaceInBayCell = (cellId) => {
    const info = getRowColFromCellId(cellId);
    if (!info) return false;

    const { bayIndex, row, col } = info;

    // Bottom row is always valid
    if (row === baySize.rows - 1) return true;

    // Check if there's a container below
    const belowCellId = `bay-${bayIndex}-${(row + 1) * baySize.columns + col}`;
    return droppedItems.some((item) => item.area === belowCellId);
  };

  const isCellEmpty = (cellId) => !droppedItems.some((item) => item.area === cellId);

  const canRemoveFromBay = (cellId) => {
    const info = getRowColFromCellId(cellId);
    if (!info) return true; // Not a bay cell, can remove

    const { bayIndex, row, col } = info;

    // Check if there's a container above
    if (row > 0) {
      const aboveCellId = `bay-${bayIndex}-${(row - 1) * baySize.columns + col}`;
      const hasAbove = droppedItems.some((item) => item.area === aboveCellId);
      if (hasAbove) return false;
    }

    return true;
  };

  // Modify handleDragStart to prevent unauthorized dragging
  const handleDragStart = (event) => {
    if (!isDraggingAllowed) {
      event.preventDefault();
      return;
    }
    setDraggingItem(event.active?.id || null);
  };

  const handleDragEnd = (event) => {
    const activeId = event.active?.id;
    const overId = event.over?.id;
    setDraggingItem(null);

    if (!activeId || !overId) return;

    // Check if cell is empty
    if (!isCellEmpty(overId)) return;

    // Validate bay placement
    if (overId.startsWith("bay-") && !canPlaceInBayCell(overId)) {
      return;
    }

    // Check if can remove from current position
    const currentItem = droppedItems.find((item) => item.id === activeId);
    if (currentItem?.area?.startsWith("bay-") && !canRemoveFromBay(currentItem.area)) {
      return;
    }

    // Move the container
    setDroppedItems((items) => items.map((item) => (item.id === activeId ? { ...item, area: overId } : item)));

    // Check for step completion
    if (currentStep === 4 && activeId === 105 && overId.startsWith("bay-")) {
      setActionCompleted({ ...actionCompleted, "move-105-to-bay": true });
      setTimeout(() => nextStep(), 1500);
    }

    // Check practice mode completion
    if (currentStep === 9) {
      const newDroppedItems = droppedItems.map((item) => (item.id === activeId ? { ...item, area: overId } : item));
      const containersInBay = newDroppedItems.filter((item) => item.area?.startsWith("bay-")).length;
      if (containersInBay >= 7) {
        setTimeout(() => {
          setActionCompleted({ ...actionCompleted, "practice-mode": true });
        }, 500);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);

      // Enable practice mode at step 9
      if (currentStep + 1 === 9) {
        setIsPracticeMode(true);
      }
    } else {
      setShowCelebration(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep - 1 < 9) {
        setIsPracticeMode(false);
      }
    }
  };

  const skipTutorial = () => {
    setShowCelebration(true);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPracticeMode(false);
    setActionCompleted({});
    setShowCelebration(false);
    setDroppedItems([
      // Bay initial positions
      { id: 101, area: "bay-0-10", color: getPortColor("MDN"), type: "dry" },
      { id: 102, area: "bay-0-11", color: getPortColor("BPN"), type: "dry" },
      { id: 103, area: "bay-1-10", color: getPortColor("JYP"), type: "dry" },
      { id: 104, area: "bay-1-11", color: getPortColor("MKS"), type: "dry" },

      // Dock initial positions - match the original setup
      { id: 105, area: "docks-1", color: getPortColor("MDN"), type: "dry" },
      { id: 106, area: "docks-2", color: getPortColor("BPN"), type: "dry" },
      { id: 107, area: "docks-3", color: getPortColor("MKS"), type: "dry" },
      { id: 108, area: "docks-4", color: getPortColor("SBY"), type: "dry" },
    ]);
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  const canProceed = currentStep === TUTORIAL_STEPS.length - 1 ? true : !step.requiredAction || actionCompleted[step.requiredAction];

  // Auto-scroll to highlighted element
  useEffect(() => {
    if (step.highlight) {
      const element = document.getElementById(step.highlight);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep, step.highlight]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">BLC Shipping Tutorial</h1>
              <button onClick={() => setShowGuideModal(true)} className="flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Ship Bay Guide
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetDemo} className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              <button onClick={skipTutorial} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                Skip Tutorial
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-700">
                Step {currentStep + 1} / {TUTORIAL_STEPS.length}
              </span>
              <span className="text-xs text-gray-500 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Panel */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <TutorialOverlay step={step} isVisible={!isPracticeMode}>
              {/* Main Demo Area */}
              <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="p-6 space-y-6">
                  {/* Ship Bay */}
                  <div
                    className={`relative ${
                      step.highlight === "bay"
                        ? "z-30 ring-4 ring-yellow-400"
                        : currentStep === 4 || step.requiredAction === "practice-mode"
                        ? "" // No opacity reduction during drag & drop steps
                        : "opacity-50"
                    }`}
                    id="bay"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          Ship Bay
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm">Week 1</span>
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full shadow-sm">Port: SBY</span>
                        </div>
                      </div>

                      {/* Port Sequence Legend */}
                      <div className="mb-4 bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">📍 Port Order:</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {portSequence.map((port, idx) => (
                            <React.Fragment key={port}>
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: getPortColor(port) }} />
                                <span className="text-xs font-bold text-gray-700">{port}</span>
                              </div>
                              {idx < portSequence.length - 1 && <span className="text-gray-400 text-xs">→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Bay Grid */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {Array.from({ length: bayCount }).map((_, bayIndex) => (
                            <div
                              key={`bay-${bayIndex}`}
                              className={`flex-shrink-0 rounded-lg overflow-hidden shadow-md ${
                                bayTypes[bayIndex] === "reefer" ? "bg-gradient-to-b from-blue-100 to-blue-50 border-2 border-blue-300" : "bg-gradient-to-b from-gray-50 to-white border-2 border-gray-300"
                              }`}
                            >
                              {/* Bay Header */}
                              <div className={`text-center py-2 px-3 border-b-2 ${bayTypes[bayIndex] === "reefer" ? "bg-blue-200 border-blue-300" : "bg-gray-200 border-gray-300"}`}>
                                <div className="text-xs font-bold text-gray-800">Bay {bayIndex + 1}</div>
                                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${bayTypes[bayIndex] === "reefer" ? "bg-blue-300 text-blue-900" : "bg-gray-300 text-gray-700"}`}>
                                  {bayTypes[bayIndex].toUpperCase()}
                                </div>
                              </div>

                              {/* Bay Grid */}
                              <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
                                {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                                  const cellId = `bay-${bayIndex}-${cellIndex}`;
                                  const rowIndex = Math.floor(cellIndex / baySize.columns);
                                  const colIndex = cellIndex % baySize.columns;
                                  const item = droppedItems.find((i) => i.area === cellId);

                                  return (
                                    <DroppableCell key={cellId} id={cellId} coordinates={`${bayIndex + 1}${rowIndex}${colIndex}`} isValid={true} isHistoryView={false}>
                                      {item && (
                                        <DraggableContainer
                                          id={item.id}
                                          text={item.id}
                                          color={item.color}
                                          type={item.type}
                                          destination={containerDestinationsCache[item.id]}
                                          isDragging={draggingItem === item.id}
                                          isHistoryView={false}
                                          isDraggingAllowed={isDraggingAllowed}
                                        />
                                      )}
                                    </DroppableCell>
                                  );
                                })}
                              </ContainerBay>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ship Dock */}
                  <div
                    className={`relative ${
                      step.highlight === "dock"
                        ? "z-30 ring-4 ring-yellow-400"
                        : currentStep === 4 || step.requiredAction === "practice-mode"
                        ? "" // No opacity reduction during drag & drop steps
                        : "opacity-50"
                    }`}
                    id="dock"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border-2 border-gray-200 shadow-lg">
                      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17z" />
                        </svg>
                        Ship Dock
                      </h3>

                      {/* MODIFIED: Updated dock container grid styling */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="overflow-x-auto">
                          <div className="inline-block min-w-full">
                            <ContainerDock rows={dockSize.rows} columns={dockSize.columns} className="grid gap-2">
                              {Array.from({ length: dockSize.rows * dockSize.columns }).map((_, position) => {
                                const cellId = `docks-${position}`;
                                const item = droppedItems.find((i) => i.area === cellId);

                                return (
                                  <DroppableCell key={cellId} id={cellId} coordinates={`D${position}`} isValid={true} isHistoryView={false}>
                                    {item && (
                                      <DraggableContainer
                                        id={item.id}
                                        text={item.id}
                                        color={item.color}
                                        type={item.type}
                                        destination={containerDestinationsCache[item.id]}
                                        isDragging={draggingItem === item.id}
                                        isHistoryView={false}
                                        isDraggingAllowed={isDraggingAllowed}
                                      />
                                    )}
                                  </DroppableCell>
                                );
                              })}
                            </ContainerDock>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DragOverlay>
                    {draggingItem && (
                      <div className="rounded-lg shadow-2xl transform scale-110" style={{ width: "60px", height: "60px" }}>
                        <DraggableContainer
                          id={draggingItem}
                          text={draggingItem}
                          color={containers.find((c) => c.id === draggingItem)?.color}
                          type={containers.find((c) => c.id === draggingItem)?.type || "dry"}
                          destination={containerDestinationsCache[draggingItem] || ""}
                          isDraggingAllowed={isDraggingAllowed}
                        />
                      </div>
                    )}
                  </DragOverlay>
                </div>
              </DndContext>
            </TutorialOverlay>
          </div>
          <div className="col-span-4">
            <div className="row">
              <div
                className={`sticky top-24 bg-gradient-to-r ${
                  currentStep === 0 ? "from-indigo-500 to-purple-600" : currentStep === TUTORIAL_STEPS.length - 1 ? "from-green-500 to-emerald-600" : "from-blue-500 to-blue-600"
                } rounded-2xl shadow-xl p-6 text-white`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                    <p className="text-blue-50 text-sm leading-relaxed mb-2">{step.description}</p>
                    <p className="text-white font-medium text-xs bg-white/10 backdrop-blur px-3 py-2 rounded-lg inline-block">{step.instruction}</p>

                    {step.requiredAction && !actionCompleted[step.requiredAction] && step.requiredAction !== "complete" && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Action Required!
                      </div>
                    )}

                    {step.requiredAction === "practice-mode" && actionCompleted["practice-mode"] && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-green-400 text-green-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Great Job!
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4 space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    {TUTORIAL_STEPS.map((s, idx) => (
                      <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? "bg-white w-8" : idx < currentStep ? "bg-white/70 w-2" : "bg-white/30 w-2"}`} />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${currentStep === 0 ? "opacity-40 cursor-not-allowed bg-white/10" : "bg-white/20 hover:bg-white/30"}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>

                    <button
                      onClick={nextStep}
                      disabled={!canProceed}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                        !canProceed ? "opacity-40 cursor-not-allowed bg-white/10" : currentStep === TUTORIAL_STEPS.length - 1 ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {currentStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-3">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Information
                  </h4>
                  <ul className="text-[10px] space-y-1.5 text-blue-50">
                    <li>• Containers can only be placed on bottom row or on top of another</li>
                    <li>• Bay 3 (Reefer) is for refrigerated containers</li>
                    <li>
                      • Stack by port order: <strong>MKS bottom → SBY top</strong>
                    </li>
                    <li>• Committed cards MUST be accepted</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="row">
              {/* Sales Call Cards Section */}
              {currentStep >= 8 && (
                <div className={`transition-all mt-6 duration-500 ${step.highlight === "sales" ? "ring-4 ring-yellow-400 ring-opacity-60 rounded-xl shadow-2xl" : ""}`} id="sales">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-lg">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Sales Call Card
                    </h3>

                    <div className="gap-4 text-xs">
                      {/* Card 1 - Committed */}
                      <div className="bg-white p-4 rounded-lg border-2 border-yellow-300 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-800">Booking #C001</span>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-300">COMMITTED</span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <span>DRY</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Route:</span>
                            <span>SBY → MDN</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Quantity:</span>
                            <span>3 containers</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Revenue:</span>
                            <span className="font-bold text-green-600">{formatIDR(56000000)}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-semibold" disabled>
                            Accept
                          </button>
                          <button className="flex-1 bg-red-500 text-white text-xs py-2 rounded-lg font-semibold" disabled>
                            Reject
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-center">Can be rejected</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Tutorial Complete!</h2>
            <p className="text-gray-600 mb-6 text-base leading-relaxed">Congratulations! You've completed the BLC Shipping basics.</p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">✨ You've learned: Drag & Drop, Gravity Rule, Port Sequence, Restowage, and Sales Calls!</p>
            </div>

            <div className="flex gap-3">
              <Link to="/" className="flex-1 px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all hover:scale-105">
                Back to Home
              </Link>
              <Link to="/login" className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all hover:scale-105">
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} isSimulationMode={false} />}
    </div>
  );
};

export default InteractiveTutorial;
