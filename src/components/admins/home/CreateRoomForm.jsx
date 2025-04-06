import { useState } from "react";
import { Link } from "react-router-dom";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { HiCheck, HiChevronUpDown, HiDocumentCheck, HiPlus } from "react-icons/hi2";
import { AiFillEye } from "react-icons/ai";
import Tooltip from "../../../components/Tooltip";
import RenderShipBayLayout from "../../simulations/RenderShipBayLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import SwapConfigModal from "../../rooms/SwapConfigModal";
import DeckPreviewModal from "./DeckPreviewModal";
import useToast from "../../../toast/useToast";

// THIS IS FOR LOCAL
// const initialFormState = {
//   id: "001",
//   name: "123",
//   description: "123",
//   deck: 1,
//   ship_layout: 1,
//   max_users: 0,
//   bay_size: null,
//   bay_count: 0,
//   bay_types: [],
//   total_rounds: 2,
//   cards_limit_per_round: 10,
//   cards_must_process_per_round: 8,
//   move_cost: 100000,
//   extra_moves_cost: 50000,
//   backlog_penalty_per_container_cost: 50000,
//   ideal_crane_split: 2,
//   swap_config: { SBY: "BPN", MDN: "MKS", MKS: "JYP", JYP: "MDN", BPN: "SBY" },
// };

const initialFormState = {
  id: "",
  name: "",
  description: "",
  deck: "",
  ship_layout: "",
  max_users: 0,
  bay_size: null,
  bay_count: 0,
  bay_types: [],
  total_rounds: 1,
  cards_limit_per_round: 1,
  cards_must_process_per_round: 1,
  move_cost: 100000,
  extra_moves_cost: 50000,
  ideal_crane_split: 2,
  swap_config: {},
};

const CreateRoomForm = ({ token, decks, layouts, availableUsers, setRooms, refreshRooms }) => {
  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError, showWarning } = useToast();
  const queryClient = useQueryClient();

  // Selection state
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Query state
  const [query, setQuery] = useState("");
  const [layoutQuery, setLayoutQuery] = useState("");

  // UI state
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);
  const [showDeckPreview, setShowDeckPreview] = useState(false);

  // Swap config state
  const [showSwapConfigModal, setShowSwapConfigModal] = useState(false);
  const [deckOrigins, setDeckOrigins] = useState([]);
  const [swapConfig, setSwapConfig] = useState({});

  // Reset form
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedDeck(null);
    setSelectedLayout(null);
    setSelectedUsers([]);
    setErrors({});
    setSwapConfig({});
    setDeckOrigins([]);
  };

  const createRoomMutation = useMutation({
    mutationFn: async (newRoomData) => {
      return api.post("/rooms", newRoomData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      resetForm();
      showSuccess("Room created successfully!");
    },
    onError: (error) => {
      console.error("Error creating room:", error);
      showError(error.response?.data?.message || "Failed to create room");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cards_must_process_per_round") {
      const limitPerRound = formData.cards_limit_per_round;
      const processValue = parseInt(value);

      if (processValue > limitPerRound) {
        showWarning("Must process cards cannot exceed cards limit per round");
        return;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeckChange = async (e) => {
    const deckId = e.target.value;

    if (!deckId) {
      setSelectedDeck(null);
      setFormData((prevData) => ({
        ...prevData,
        deck_id: "",
        max_users: 0,
      }));
      setDeckOrigins([]);
      return;
    }

    setSelectedDeck(decks.find((deck) => deck.id === deckId));
    setFormData((prevData) => ({
      ...prevData,
      deck_id: deckId,
    }));

    try {
      const response = await api.get(`decks/${deckId}/origins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const origins = response.data;

      setFormData((prevData) => ({
        ...prevData,
        max_users: Object.keys(origins).length,
      }));

      setDeckOrigins(Object.values(origins));
      console.log("Deck origins:", origins);
    } catch (error) {
      console.error("Error selecting deck:", error);
      showError("Error selecting deck. Please try again.");
    }
  };

  const handleSwapConfigSave = (newConfig) => {
    setSwapConfig(newConfig);
    setFormData((prev) => ({
      ...prev,
      swap_config: newConfig,
    }));
    setShowSwapConfigModal(false);
  };

  // Create room submission
  const createRoom = async (e) => {
    e.preventDefault();
    setErrors({});

    if (parseInt(formData.cards_must_process_per_round) > parseInt(formData.cards_limit_per_round)) {
      setErrors({
        cards_must_process_per_round: ["Must process cards cannot exceed cards limit per round"],
      });
      return;
    }

    if (selectedUsers.length > formData.max_users) {
      setErrors({
        assigned_users: [`You can only assign up to ${formData.max_users} users to this room`],
      });
      showError(`Too many users selected: max ${formData.max_users} allowed`);
      return;
    }

    const payload = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      deck: formData.deck,
      ship_layout: formData.ship_layout,
      max_users: formData.max_users,
      total_rounds: formData.total_rounds,
      move_cost: formData.move_cost,
      extra_moves_cost: formData.extra_moves_cost,
      ideal_crane_split: formData.ideal_crane_split,
      backlog_penalty_per_container_cost: formData.backlog_penalty_per_container_cost,
      cards_must_process_per_round: formData.cards_must_process_per_round,
      cards_limit_per_round: formData.cards_limit_per_round,
      assigned_users: selectedUsers,
      swap_config: formData.swap_config,
    };

    console.log("Create room payload:", payload);

    createRoomMutation.mutate(payload);
  };

  // Filter decks based on query
  const filteredDecks = query === "" ? decks : decks.filter((deck) => deck.name.toLowerCase().includes(query.toLowerCase()));

  // Filter layouts based on query
  const filteredLayouts = layoutQuery === "" ? layouts : layouts.filter((layout) => layout.name.toLowerCase().includes(layoutQuery.toLowerCase()));

  return (
    <form onSubmit={createRoom} className="bg-white p-8 rounded-lg shadow-lg space-y-6 mb-4">
      <div className="w-full">
        <h3 className="text-1xl font-bold text-gray-900">Create New Room</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Room ID Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="id" className="block text-gray-700 font-semibold">
              Room ID
            </label>
            <Tooltip>Enter a unique identifier for the room</Tooltip>
          </div>
          <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Room ID" />
          {errors.id && <p className="text-red-500 mt-1">{errors.id[0]}</p>}
        </div>
        {/* Room Name Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="name" className="block text-gray-700 font-semibold">
              Room Name
            </label>
            <Tooltip>Enter a descriptive name for the room</Tooltip>
          </div>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Room Name" />
          {errors.name && <p className="text-red-500 mt-1">{errors.name[0]}</p>}
        </div>
        {/* Description Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="description" className="block text-gray-700 font-semibold">
              Room Description
            </label>
            <Tooltip>Provide additional details about the room</Tooltip>
          </div>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter Room Description"
          />
          {errors.description && <p className="text-red-500 mt-1">{errors.description[0]}</p>}
        </div>
        {/* Total Rounds Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="total_rounds" className="block text-gray-700 font-semibold">
              Total Rounds
            </label>
            <Tooltip>Number of rounds in the simulation</Tooltip>
          </div>
          <input type="number" id="total_rounds" name="total_rounds" value={formData.total_rounds} onChange={handleChange} min="1" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
          {errors.total_rounds && <p className="text-red-500 mt-1">{errors.total_rounds[0]}</p>}
        </div>
        {/* Cards Limit Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="cards_limit_per_round" className="block text-gray-700 font-semibold">
              Cards Per Round
            </label>
            <Tooltip>Maximum cards allowed per round</Tooltip>
          </div>
          <input
            type="number"
            id="cards_limit_per_round"
            name="cards_limit_per_round"
            value={formData.cards_limit_per_round}
            onChange={handleChange}
            min="1"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {errors.cards_limit_per_round && <p className="text-red-500 mt-1">{errors.cards_limit_per_round[0]}</p>}
        </div>
        {/* Cards Must Process Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="cards_must_process_per_round" className="block text-gray-700 font-semibold">
              Cards Must Process
            </label>
            <Tooltip>Number of cards that must be accepted/rejected from shown cards</Tooltip>
          </div>
          <input
            type="number"
            id="cards_must_process_per_round"
            name="cards_must_process_per_round"
            value={formData.cards_must_process_per_round}
            onChange={handleChange}
            min="1"
            max={formData.cards_limit_per_round}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Move Cost Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="move_cost" className="block text-gray-700 font-semibold">
              Move Cost (Rp)
            </label>
            <Tooltip>Cost per move (discharge or load)</Tooltip>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">Rp</span>
            </div>
            <input
              type="number"
              name="move_cost"
              id="move_cost"
              className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="100000"
              min="1"
              value={formData.move_cost}
              onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">per move</span>
            </div>
          </div>
        </div>

        {/* Extra Moves Cost Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="extra_moves_cost" className="block text-gray-700 font-semibold">
              Extra Moves Cost (Rp)
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
              className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="50000"
              min="1"
              value={formData.extra_moves_cost}
              onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">per move</span>
            </div>
          </div>
        </div>

        {/* Ideal Crane Split Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="ideal_crane_split" className="block text-gray-700 font-semibold">
              Ideal Crane Split
            </label>
            <Tooltip>Number of cranes to be used as a ideal value for splitting</Tooltip>
          </div>
          <input type="number" id="ideal_crane_split" name="ideal_crane_split" value={formData.ideal_crane_split} onChange={handleChange} min="1" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>

        {/* Backlog Container Cost Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="extra_moves_cost" className="block text-gray-700 font-semibold">
              Backlog Container Cost (Rp)
            </label>
            <Tooltip>Cost per container that is not unloaded on time (in weeks)</Tooltip>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">Rp</span>
            </div>
            <input
              type="number"
              name="backlog_penalty_per_container_cost"
              id="backlog_penalty_per_container_cost"
              className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="50000"
              min="1"
              value={formData.backlog_penalty_per_container_cost}
              onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">per move</span>
            </div>
          </div>
        </div>

        {/* Deck Selection */}
        <div className="flex flex-col relative">
          <div className="flex items-center">
            <label htmlFor="deck_id" className="block text-gray-700 font-semibold">
              Deck
            </label>
            <Tooltip>Select a deck of cards to be used in this room.</Tooltip>
          </div>
          <Combobox
            value={selectedDeck}
            onChange={(deck) => {
              if (deck) {
                setSelectedDeck(deck);
                setFormData((prev) => ({
                  ...prev,
                  deck: deck.id,
                }));
                handleDeckChange({ target: { value: deck.id } });
              } else {
                setSelectedDeck(null);
                setFormData((prev) => ({
                  ...prev,
                  deck: "",
                }));
              }
            }}
          >
            <div className="relative">
              {decks.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-all hover:border-blue-300 hover:bg-gray-100">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <HiDocumentCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No Decks Available</h3>
                  <p className="mt-2 text-sm text-gray-500">Get started by creating a new deck</p>
                  <Link to="/admin-decks" className="mt-4 inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 hover:scale-105 transition-all duration-200">
                    <HiPlus className="h-5 w-5" />
                    Create New Deck
                  </Link>
                </div>
              ) : (
                <>
                  <div className="group relative w-full cursor-pointer">
                    <ComboboxInput
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      displayValue={(deck) => deck?.name}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Select a deck..."
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400 group-hover:text-blue-500" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {filteredDecks.length === 0 && query !== "" ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No decks found matching {query}</div>
                    ) : (
                      filteredDecks.map((deck) => (
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
                </>
              )}
            </div>
          </Combobox>

          {/* Add this Preview button */}
          {selectedDeck && (
            <button type="button" onClick={() => setShowDeckPreview(true)} className="mt-2 inline-flex items-center gap-x-2 text-sm text-blue-600 hover:text-blue-700">
              <AiFillEye className="h-5 w-5" />
              Preview Cards
            </button>
          )}
          {errors.deck && <p className="text-red-500 mt-1">{errors.deck[0]}</p>}
        </div>

        {/* Assign Users Field */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label className="block text-gray-700 font-semibold">Assign Users</label>
              <Tooltip>Select users who can join this room</Tooltip>
            </div>
            <span className={`text-sm ${selectedUsers.length > formData.max_users ? "text-red-600 font-medium" : "text-gray-500"}`}>
              {selectedUsers.length}/{formData.max_users} users
            </span>
          </div>
          <Combobox
            multiple
            value={selectedUsers}
            onChange={(userIds) => {
              if (userIds.length <= formData.max_users) {
                setSelectedUsers(userIds);
              } else {
                showWarning(`Maximum ${formData.max_users} users can be assigned to this room`, {
                  toastId: "max-users-warning",
                });
              }
            }}
          >
            <div className="relative">
              <div className="relative w-full">
                <ComboboxInput
                  className={`w-full rounded-lg border ${
                    selectedUsers.length > formData.max_users ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:ring-2`}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Select up to ${formData.max_users} users...`}
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
                  <div className="px-4 py-3 text-sm text-gray-500">No users available</div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${selectedUsers.length > formData.max_users ? "text-red-600" : "text-gray-500"}`}>
                          {selectedUsers.length}/{formData.max_users} users selected
                        </span>
                        {selectedUsers.length > 0 && (
                          <button onClick={() => setSelectedUsers([])} className="text-xs text-red-500 hover:text-red-700">
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    {availableUsers
                      .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
                      .map((user) => {
                        // Check if this user is already selected
                        const isSelected = selectedUsers.includes(user.id);
                        // Disable selecting more users if at max and this one isn't already selected
                        const disableSelection = selectedUsers.length >= formData.max_users && !isSelected;

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
          {selectedUsers.length > formData.max_users && (
            <p className="text-red-500 mt-1">
              You've selected {selectedUsers.length} users, but this room can only have {formData.max_users} users
            </p>
          )}
          {errors.assigned_users && <p className="text-red-500 mt-1">{errors.assigned_users[0]}</p>}
        </div>
        {/* Ship Layout Selection */}
        <div className="flex flex-col relative">
          <div className="flex items-center">
            <label className="block text-gray-700 font-semibold">Ship Layout</label>
            <Tooltip>Select a predefined ship bay layout</Tooltip>
          </div>
          <Combobox
            value={selectedLayout}
            onChange={(layout) => {
              setSelectedLayout(layout);
              if (layout) {
                setFormData((prev) => ({
                  ...prev,
                  ship_layout: layout.id,
                  bay_size: layout.bay_size,
                  bay_count: layout.bay_count,
                  bay_types: layout.bay_types,
                }));
              }
            }}
          >
            <div className="relative">
              {layouts.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-all hover:border-blue-300 hover:bg-gray-100">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <HiDocumentCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No Layouts Available</h3>
                  <p className="mt-2 text-sm text-gray-500">Get started by creating a new layout</p>
                  <Link to="/bay-layouts" className="mt-4 inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 hover:scale-105 transition-all duration-200">
                    <HiPlus className="h-5 w-5" />
                    Create New Layout
                  </Link>
                </div>
              ) : (
                <>
                  <div className="group relative w-full cursor-pointer">
                    <ComboboxInput
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      displayValue={(layout) => layout?.name}
                      onChange={(event) => setLayoutQuery(event.target.value)}
                      placeholder="Select a layout..."
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400 group-hover:text-blue-500" aria-hidden="true" />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {filteredLayouts.length === 0 && layoutQuery !== "" ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No layouts found matching {layoutQuery}</div>
                    ) : (
                      filteredLayouts.map((layout) => (
                        <ComboboxOption key={layout.id} value={layout} className={({ active }) => `relative cursor-pointer select-none px-4 py-3 text-sm transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-900"}`}>
                          {({ selected, active }) => (
                            <div className="flex items-center justify-between">
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {layout.name} ({layout.bay_count} bays)
                              </span>
                              {selected && (
                                <span className={`flex items-center ${active ? "text-blue-700" : "text-blue-600"}`}>
                                  <HiCheck className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </div>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </>
              )}
            </div>
          </Combobox>
          {selectedLayout && (
            <button type="button" onClick={() => setShowLayoutPreview(true)} className="mt-2 inline-flex items-center gap-x-2 text-sm text-blue-600 hover:text-blue-700">
              <AiFillEye className="h-5 w-5" />
              Preview
            </button>
          )}

          {errors.ship_layout && <p className="text-red-500 mt-1">{errors.ship_layout[0]}</p>}
        </div>
        {/* Port Swap Configuration */}
        <div className="flex flex-col lg:col-span-3 md:col-span-2">
          <div className="flex items-center">
            <label className="block text-gray-700 font-semibold">Port Swap Configuration</label>
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
                disabled={!selectedDeck || formData.max_users === 0}
                className={`ml-2 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
          ${selectedDeck && formData.max_users > 0 ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
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

          {errors.swap_config && <p className="text-red-500 mt-1">{errors.swap_config[0]}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button type="submit" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
          Create Room
        </button>
      </div>

      {/* Preview Modal */}
      {showLayoutPreview && selectedLayout && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedLayout.name} Preview</h3>
              <button onClick={() => setShowLayoutPreview(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <RenderShipBayLayout
                bayCount={selectedLayout.bay_count}
                baySize={typeof selectedLayout.bay_size === "string" ? JSON.parse(selectedLayout.bay_size) : selectedLayout.bay_size}
                bayTypes={typeof selectedLayout.bay_types === "string" ? JSON.parse(selectedLayout.bay_types) : selectedLayout.bay_types}
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
      {showDeckPreview && selectedDeck && <DeckPreviewModal isOpen={showDeckPreview} onClose={() => setShowDeckPreview(false)} deckId={selectedDeck.id} token={token} />}

      <SwapConfigModal isOpen={showSwapConfigModal} onClose={() => setShowSwapConfigModal(false)} deckOrigins={deckOrigins} onSave={handleSwapConfigSave} initialConfig={swapConfig} />
    </form>
  );
};

export default CreateRoomForm;
