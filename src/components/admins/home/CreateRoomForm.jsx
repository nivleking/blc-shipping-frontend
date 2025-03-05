import { useState } from "react";
import { Link } from "react-router-dom";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { HiCheck, HiChevronUpDown, HiDocumentCheck, HiPlus } from "react-icons/hi2";
import { AiFillEye } from "react-icons/ai";
import Tooltip from "../../../components/Tooltip";
import RenderShipBayLayout from "../../../components/simulations/RenderShipBayLayout";
import { api } from "../../../axios/axios";
import { toast } from "react-toastify";

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
};

const CreateRoomForm = ({ token, decks, layouts, availableUsers, setRooms }) => {
  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Selection state
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Query state
  const [query, setQuery] = useState("");
  const [layoutQuery, setLayoutQuery] = useState("");

  // UI state
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedDeck(null);
    setSelectedLayout(null);
    setSelectedUsers([]);
    setErrors({});
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || "",
    }));
  };

  // Handle deck selection and update max users
  const handleDeckChange = async (e) => {
    const deckId = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      deck_id: deckId,
    }));

    if (deckId) {
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
      } catch (error) {
        console.error("Error selecting deck:", error);
        toast.error("Error selecting deck. Please try again.");
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        max_users: 0,
      }));
    }
  };

  // Create room submission
  const createRoom = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      deck: formData.deck,
      ship_layout: formData.ship_layout,
      max_users: formData.max_users,
      total_rounds: formData.total_rounds,
      cards_limit_per_round: formData.cards_limit_per_round,
      assigned_users: selectedUsers,
    };

    try {
      const response = await api.post("rooms", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setRooms((prevRooms) => [...prevRooms, response.data]);
        toast.success("Room created successfully!");
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while creating the room!");
      setErrors(error.response?.data?.errors || {});
    }
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

        {/* Assign Users Field */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <label className="block text-gray-700 font-semibold">Assign Group Users</label>
            <Tooltip>Select group users who can join this room</Tooltip>
          </div>
          <Combobox multiple value={selectedUsers} onChange={(userIds) => setSelectedUsers(userIds)}>
            <div className="relative">
              <div className="relative w-full">
                <ComboboxInput
                  className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Select group users..."
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
                        <span className="text-sm text-gray-500">{selectedUsers.length} group users selected</span>
                        {selectedUsers.length > 0 && (
                          <button onClick={() => setSelectedUsers([])} className="text-xs text-red-500 hover:text-red-700">
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    {availableUsers
                      .filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
                      .map((user) => (
                        <ComboboxOption
                          key={user.id}
                          value={user.id}
                          className={({ active, selected }) => `relative cursor-pointer select-none px-4 py-3 text-sm transition-colors ${active ? "bg-blue-50" : ""} ${selected ? "bg-blue-50" : ""}`}
                        >
                          {({ active, selected }) => (
                            <div className="flex items-center justify-between">
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{user.name}</span>
                              {selected && (
                                <span className={`flex items-center ${active ? "text-blue-700" : "text-blue-600"}`}>
                                  <HiCheck className="h-5 w-5" />
                                </span>
                              )}
                            </div>
                          )}
                        </ComboboxOption>
                      ))}
                  </>
                )}
              </ComboboxOptions>
            </div>
          </Combobox>
          {errors.assigned_users && <p className="text-red-500 mt-1">{errors.assigned_users[0]}</p>}
        </div>

        <div className="col-span-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  setSelectedDeck(deck);
                  setFormData((prev) => ({
                    ...prev,
                    deck: deck.id,
                  }));
                  handleDeckChange({ target: { value: deck.id } });
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
              {errors.deck && <p className="text-red-500 mt-1">{errors.deck[0]}</p>}
            </div>

            {/* Total Ports Field */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="max_users" className="block text-gray-700 font-semibold">
                  Total Ports (Users)
                </label>
                <Tooltip>Maximum number of users (auto-set from deck)</Tooltip>
              </div>
              <input type="number" id="max_users" name="max_users" value={formData.max_users} readOnly className="p-3 border border-gray-300 rounded-lg bg-gray-50" style={{ cursor: "not-allowed" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-start space-x-4">
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
    </form>
  );
};

export default CreateRoomForm;
