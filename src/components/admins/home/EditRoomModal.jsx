import { useState, useEffect } from "react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { HiCheck, HiChevronUpDown } from "react-icons/hi2";
import { AiFillEye } from "react-icons/ai";
import RenderShipBayLayout from "../../simulations/RenderShipBayLayout";
import { toast } from "react-toastify";
import DeckPreviewModal from "./DeckPreviewModal";
import Tooltip from "../../Tooltip";
import SwapConfigModal from "../../rooms/SwapConfigModal";

const EditRoomModal = ({ showEditModal, editingRoom, setEditingRoom, setShowEditModal, layouts, availableUsers, decks, handleUpdateRoom, selectedDeck, setSelectedDeck, handleDeckChange }) => {
  const [layoutQuery, setLayoutQuery] = useState("");
  const [query, setQuery] = useState("");
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [showDeckPreview, setShowDeckPreview] = useState(false);
  const [deckOrigins, setDeckOrigins] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSwapConfigModal, setShowSwapConfigModal] = useState(false);
  const [swapConfig, setSwapConfig] = useState({});

  useEffect(() => {
    // Fetch origins when deck changes to determine max_users
    if (editingRoom?.deck && showEditModal) {
      fetchDeckOrigins(editingRoom.deck);
    }

    // Initialize swap config from editingRoom
    if (editingRoom?.swap_config && showEditModal) {
      const config = typeof editingRoom.swap_config === "string" ? JSON.parse(editingRoom.swap_config) : editingRoom.swap_config;
      setSwapConfig(config);
    }
  }, [editingRoom?.deck, editingRoom?.swap_config, showEditModal]);

  const fetchDeckOrigins = async (deckId) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/origins`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Update the max_users based on deck origins
        if (editingRoom) {
          setEditingRoom({
            ...editingRoom,
            max_users: Object.keys(data).length,
          });
        }
        setDeckOrigins(Object.values(data));
      }
    } catch (error) {
      console.error("Error fetching deck origins:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special validation for cards_must_process_per_round
    if (name === "cards_must_process_per_round") {
      const limitPerRound = editingRoom.cards_limit_per_round;
      const processValue = parseInt(value);

      if (processValue > limitPerRound) {
        toast.warning("Must process cards cannot exceed cards limit per round");
        return;
      }
    }

    setEditingRoom((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSwapConfigSave = (newConfig) => {
    setSwapConfig(newConfig);
    setEditingRoom((prev) => ({
      ...prev,
      swap_config: newConfig,
    }));
    setShowSwapConfigModal(false);
  };

  if (!showEditModal || !editingRoom) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Room: {editingRoom.name}</h3>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleUpdateRoom} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Room ID (non-editable) */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Room ID</label>
                <Tooltip>Unique identifier for the room (cannot be changed)</Tooltip>
              </div>
              <input type="text" value={editingRoom.id} disabled className="p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
            </div>

            {/* Room Name */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Room Name</label>
                <Tooltip>Enter a descriptive name for the room</Tooltip>
              </div>
              <input type="text" name="name" value={editingRoom.name} onChange={handleChange} className={`p-3 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`} />
              {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Description</label>
                <Tooltip>Provide additional details about the room</Tooltip>
              </div>
              <input
                type="text"
                name="description"
                value={editingRoom.description}
                onChange={handleChange}
                className={`p-3 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
              />
              {errors.description && <p className="text-red-500 mt-1 text-sm">{errors.description}</p>}
            </div>

            {/* Total Rounds */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Total Rounds</label>
                <Tooltip>Number of rounds in the simulation</Tooltip>
              </div>
              <input
                type="number"
                name="total_rounds"
                value={editingRoom.total_rounds}
                onChange={handleChange}
                min="1"
                className={`p-3 border ${errors.total_rounds ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
              />
              {errors.total_rounds && <p className="text-red-500 mt-1 text-sm">{errors.total_rounds}</p>}
            </div>

            {/* Cards Limit Per Round */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Cards Per Round</label>
                <Tooltip>Maximum cards allowed per round</Tooltip>
              </div>
              <input
                type="number"
                name="cards_limit_per_round"
                value={editingRoom.cards_limit_per_round}
                onChange={handleChange}
                min="1"
                className={`p-3 border ${errors.cards_limit_per_round ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
              />
              {errors.cards_limit_per_round && <p className="text-red-500 mt-1 text-sm">{errors.cards_limit_per_round}</p>}
            </div>

            {/* Cards Must Process Field */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Cards Must Process</label>
                <Tooltip>Number of cards that must be accepted/rejected from shown cards</Tooltip>
              </div>
              <input
                type="number"
                name="cards_must_process_per_round"
                value={editingRoom.cards_must_process_per_round}
                onChange={handleChange}
                min="1"
                max={editingRoom.cards_limit_per_round}
                className={`p-3 border ${errors.cards_must_process_per_round ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
              />
              {errors.cards_must_process_per_round && <p className="text-red-500 mt-1 text-sm">{errors.cards_must_process_per_round}</p>}
            </div>

            {/* Move Cost */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="move_cost" className="text-gray-700 font-semibold mb-2">
                  Move Cost (IDR)
                </label>
                <Tooltip>Cost per move (discharge or load)</Tooltip>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">Rp</span>
                </div>
                <input
                  type="number"
                  id="move_cost"
                  name="move_cost"
                  className={`w-full p-3 pl-10 pr-12 border ${errors.move_cost ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
                  placeholder="1000000"
                  min="1"
                  value={editingRoom.move_cost || 1000000}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">per move</span>
                </div>
              </div>
              {errors.move_cost && <p className="text-red-500 mt-1 text-sm">{errors.move_cost}</p>}
            </div>

            {/* Extra Moves Cost */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="extra_moves_cost" className="text-gray-700 font-semibold mb-2">
                  Extra Moves Cost (IDR)
                </label>
                <Tooltip>Cost per extra move (discharge or load) based on long crane calculation</Tooltip>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">Rp</span>
                </div>
                <input
                  type="number"
                  name="extra_moves_cost"
                  id="extra_moves_cost"
                  className={`w-full p-3 pl-10 pr-12 border ${errors.extra_moves_cost ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
                  placeholder="50000"
                  min="1"
                  value={editingRoom.extra_moves_cost || 50000}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">per move</span>
                </div>
              </div>
              {errors.extra_moves_cost && <p className="text-red-500 mt-1 text-sm">{errors.extra_moves_cost}</p>}
            </div>

            {/* Ideal Crane Split */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="ideal_crane_split" className="text-gray-700 font-semibold mb-2">
                  Ideal Crane Split
                </label>
                <Tooltip>Number of cranes to be used as an ideal value for splitting</Tooltip>
              </div>
              <input
                type="number"
                id="ideal_crane_split"
                name="ideal_crane_split"
                value={editingRoom.ideal_crane_split || 2}
                onChange={handleChange}
                min="1"
                max="8"
                className={`p-3 border ${errors.ideal_crane_split ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:border-blue-500`}
              />
              {errors.ideal_crane_split && <p className="text-red-500 mt-1 text-sm">{errors.ideal_crane_split}</p>}
            </div>

            {/* Deck Selection */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Deck</label>
                <Tooltip>Select a deck of cards to be used in this room. This will update the Max Users.</Tooltip>
              </div>
              <Combobox
                value={selectedDeck}
                onChange={(deck) => {
                  setSelectedDeck(deck);
                  if (deck) {
                    setEditingRoom((prev) => ({
                      ...prev,
                      deck: deck.id,
                    }));
                    handleDeckChange({ target: { value: deck.id } });
                  }
                }}
              >
                <div className="relative">
                  <div className="group relative w-full cursor-pointer">
                    <ComboboxInput
                      className={`w-full rounded-lg border ${
                        errors.deck ? "border-red-500" : "border-gray-300"
                      } bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      displayValue={(deck) => deck?.name || ""}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Select a deck..."
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400 group-hover:text-blue-500" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {decks.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No decks found</div>
                    ) : (
                      decks
                        .filter((deck) => !query || deck.name.toLowerCase().includes(query.toLowerCase()))
                        .map((deck) => (
                          <ComboboxOption key={deck.id} value={deck} className={({ active }) => `relative cursor-pointer select-none px-4 py-3 text-sm transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-900"}`}>
                            {({ selected, active }) => (
                              <div className="flex items-center">
                                <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{deck.name}</span>
                                {selected && (
                                  <span className={`ml-auto flex items-center ${active ? "text-blue-700" : "text-blue-600"}`}>
                                    <HiCheck className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                              </div>
                            )}
                          </ComboboxOption>
                        ))
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {/* Preview button */}
              {selectedDeck && (
                <button type="button" onClick={() => setShowDeckPreview(true)} className="mt-2 inline-flex items-center gap-x-2 text-sm text-blue-600 hover:text-blue-700">
                  <AiFillEye className="h-5 w-5" />
                  Preview Cards
                </button>
              )}
              {errors.deck && <p className="text-red-500 mt-1 text-sm">{errors.deck}</p>}
            </div>

            {/* Ship Layout */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Ship Layout</label>
                <Tooltip>Select a predefined ship bay layout</Tooltip>
              </div>
              <Combobox
                value={layouts.find((l) => l.id === editingRoom.ship_layout) || null}
                onChange={(layout) => {
                  setEditingRoom({
                    ...editingRoom,
                    ship_layout: layout.id,
                    bay_size: layout.bay_size,
                    bay_count: layout.bay_count,
                    bay_types: layout.bay_types,
                  });
                }}
              >
                <div className="relative">
                  <ComboboxInput
                    className={`w-full rounded-lg border ${errors.ship_layout ? "border-red-500" : "border-gray-300"} bg-white py-3.5 pl-4 pr-10 text-sm leading-5`}
                    displayValue={(layout) => layout?.name || ""}
                    onChange={(event) => setLayoutQuery(event.target.value)}
                    placeholder="Select a layout..."
                  />
                  <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <HiChevronUpDown className="h-5 w-5 text-gray-400" />
                  </ComboboxButton>
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 shadow-xl">
                    {layouts
                      .filter((layout) => !layoutQuery || layout.name.toLowerCase().includes(layoutQuery.toLowerCase()))
                      .map((layout) => (
                        <ComboboxOption key={layout.id} value={layout} className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-50 text-blue-900" : "text-gray-900"}`}>
                          {layout.name}
                        </ComboboxOption>
                      ))}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {editingRoom.ship_layout && (
                <button type="button" onClick={() => setShowLayoutPreview(true)} className="mt-2 inline-flex items-center gap-x-2 text-sm text-blue-600 hover:text-blue-700">
                  <AiFillEye className="h-5 w-5" />
                  Preview
                </button>
              )}
              {errors.ship_layout && <p className="text-red-500 mt-1 text-sm">{errors.ship_layout}</p>}
            </div>

            {/* Max Users (read-only) */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Max Users</label>
                <Tooltip>Maximum number of players who can join this room (determined by deck)</Tooltip>
              </div>
              <input type="number" disabled value={editingRoom.max_users || 0} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100 text-gray-600" />
            </div>

            {/* Port Swap Configuration */}
            <div className="flex flex-col md:col-span-3">
              <div className="flex items-center">
                <label className="text-gray-700 font-semibold mb-2">Port Swap Configuration</label>
                <Tooltip>Configure port swapping for each round</Tooltip>
              </div>

              <div className="flex items-center mt-2">
                <div className={`rounded-lg border ${Object.keys(swapConfig).length > 0 ? "border-blue-200 bg-blue-50" : "border-gray-300"} px-3 py-3 w-full flex justify-between items-center`}>
                  {Object.keys(swapConfig).length > 0 ? (
                    <div className="text-sm text-gray-700 flex-1 truncate">
                      {Object.keys(swapConfig).length} port {Object.keys(swapConfig).length === 1 ? "swap" : "swaps"} configured
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No port swaps configured yet</div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSwapConfigModal(true)}
                    disabled={!editingRoom.deck || editingRoom.max_users === 0}
                    className={`ml-2 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                ${editingRoom.deck && editingRoom.max_users > 0 ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  >
                    {Object.keys(swapConfig).length > 0 ? "Edit Config" : "Set Config"}
                  </button>
                </div>
              </div>

              {/* Preview current config if exists */}
              {Object.keys(swapConfig).length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg p-3 max-h-36 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(swapConfig).map(([from, to]) => (
                      <div key={from} className="flex items-center bg-white p-2 rounded-lg border border-gray-200 text-sm">
                        <span className="font-medium text-gray-600">{from}</span>
                        <span className="mx-1 text-gray-400">→</span>
                        <span className="font-medium text-blue-600">{to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.swap_config && <p className="text-red-500 mt-1 text-sm">{errors.swap_config}</p>}
            </div>

            {/* Assign Users */}
            <div className="col-span-full">
              {/* Updated Assign Users section with limits */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <label className="text-gray-700 font-semibold">Assign Users</label>
                  <Tooltip>Select group users who can join this room</Tooltip>
                </div>
                <span className={`text-sm ${editingRoom.assigned_users?.length > editingRoom.max_users ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {editingRoom.assigned_users?.length || 0}/{editingRoom.max_users} users
                </span>
              </div>
              <Combobox
                multiple
                value={editingRoom.assigned_users || []}
                onChange={(userIds) => {
                  // Only allow selection if not exceeding max_users
                  if (userIds.length <= editingRoom.max_users) {
                    setEditingRoom({ ...editingRoom, assigned_users: userIds });
                  } else {
                    // If exceeding, show toast warning
                    toast.warning(`Maximum ${editingRoom.max_users} users can be assigned to this room`, {
                      toastId: "max-users-warning",
                    });
                    // Keep the current selection
                  }
                }}
              >
                <div className="relative">
                  <div className="relative w-full">
                    <ComboboxInput
                      className={`w-full rounded-lg border ${
                        editingRoom.assigned_users?.length > editingRoom.max_users ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      } bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:ring-2`}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={`Select up to ${editingRoom.max_users} group users...`}
                      displayValue={(selectedIds) =>
                        selectedIds
                          .map((id) => availableUsers.find((user) => user.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")
                      }
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {availableUsers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No group users available</div>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${editingRoom.assigned_users?.length > editingRoom.max_users ? "text-red-600" : "text-gray-500"}`}>
                              {editingRoom.assigned_users?.length || 0}/{editingRoom.max_users} group users selected
                            </span>
                            {editingRoom.assigned_users?.length > 0 && (
                              <button onClick={() => setEditingRoom({ ...editingRoom, assigned_users: [] })} className="text-xs text-red-500 hover:text-red-700" type="button">
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>
                        {availableUsers
                          .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
                          .map((user) => {
                            // Check if this user is already selected
                            const isSelected = editingRoom.assigned_users?.includes(user.id);
                            // Disable selecting more users if at max and this one isn't already selected
                            const disableSelection = editingRoom.assigned_users?.length >= editingRoom.max_users && !isSelected;

                            return (
                              <ComboboxOption
                                key={user.id}
                                value={user.id}
                                disabled={disableSelection}
                                className={({ active, selected, disabled }) =>
                                  `relative cursor-${disabled ? "not-allowed" : "pointer"} select-none px-4 py-3 text-sm transition-colors 
                                  ${active && !disabled ? "bg-blue-50" : ""} 
                                  ${selected ? "bg-blue-50" : ""} 
                                  ${disabled ? "opacity-50 bg-gray-100" : ""}`
                                }
                              >
                                {({ active, selected }) => (
                                  <div className="flex items-center justify-between">
                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{user.name}</span>
                                    {selected ? (
                                      <span className={`flex items-center ${active ? "text-blue-700" : "text-blue-600"}`}>
                                        <HiCheck className="h-5 w-5" />
                                      </span>
                                    ) : disableSelection ? (
                                      <span className="text-xs text-gray-400">Max limit</span>
                                    ) : null}
                                  </div>
                                )}
                              </ComboboxOption>
                            );
                          })}
                      </>
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>
              {editingRoom.assigned_users?.length > editingRoom.max_users && (
                <p className="text-red-500 mt-1 text-sm">
                  You've selected {editingRoom.assigned_users.length} users, but this room can only have {editingRoom.max_users} users
                </p>
              )}
              {errors.assigned_users && <p className="text-red-500 mt-1 text-sm">{errors.assigned_users}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${editingRoom.assigned_users?.length > editingRoom.max_users ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              disabled={editingRoom.assigned_users?.length > editingRoom.max_users}
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Layout Preview Modal */}
        {showLayoutPreview && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{layouts.find((l) => l.id === editingRoom?.ship_layout)?.name} Preview</h3>
                <button onClick={() => setShowLayoutPreview(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <RenderShipBayLayout
                  bayCount={editingRoom?.bay_count}
                  baySize={typeof editingRoom?.bay_size === "string" ? JSON.parse(editingRoom?.bay_size) : editingRoom?.bay_size}
                  bayTypes={typeof editingRoom?.bay_types === "string" ? JSON.parse(editingRoom?.bay_types) : editingRoom?.bay_types}
                  readonly={true}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowLayoutPreview(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deck Preview Modal */}
        {showDeckPreview && selectedDeck && <DeckPreviewModal isOpen={showDeckPreview} onClose={() => setShowDeckPreview(false)} deckId={selectedDeck.id} token={localStorage.getItem("token")} />}

        {/* Swap Config Modal */}
        {showSwapConfigModal && <SwapConfigModal isOpen={showSwapConfigModal} onClose={() => setShowSwapConfigModal(false)} deckOrigins={deckOrigins} onSave={handleSwapConfigSave} initialConfig={swapConfig} />}
      </div>
    </div>
  );
};

export default EditRoomModal;
