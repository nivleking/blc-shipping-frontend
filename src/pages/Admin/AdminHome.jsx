import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { api, socket } from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "./AdminHome.css";
import Tooltip from "../../components/Tooltip";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { AiFillDelete, AiFillEye, AiFillFolderOpen } from "react-icons/ai";
import { HiCheck, HiChevronUpDown, HiDocumentCheck, HiPlus } from "react-icons/hi2";
import { GiShipBow } from "react-icons/gi";
import { MdOutlineGridOn } from "react-icons/md";
import { BiCube, BiGrid } from "react-icons/bi";
import { IoCreateOutline, IoTimeOutline } from "react-icons/io5";
import { HiPencilAlt } from "react-icons/hi";

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

const AdminHome = () => {
  const { user, token } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState({});
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [decks, setDecks] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Update form reset logic
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedDeck(null);
    setSelectedLayout(null);
    setSelectedUsers([]);
    setErrors({});
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchDecks();
      fetchLayouts();
      fetchAvailableUsers();
    }
  }, [token]);

  async function fetchRooms() {
    try {
      const response = await api.get("rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
      console.log("Rooms fetched:", response.data);

      response.data.forEach(async (room) => {
        const adminResponse = await api.get(`users/${room.admin_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins((prevAdmins) => ({
          ...prevAdmins,
          [room.admin_id]: adminResponse.data,
        }));
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  async function fetchDecks() {
    try {
      const response = await api.get("decks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDecks(response.data);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  }

  const fetchLayouts = async () => {
    try {
      const response = await api.get("/ship-layouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLayouts(response.data);
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get("/rooms/available-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAvailableUsers(response.data);
      console.log("Available users fetched:", response.data);
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  async function createRoom(e) {
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

    console.log("Submitting form data:", payload);

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
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "An error occurred while creating the room!");
      setErrors(error.response?.data?.errors || {});
    }
  }

  function handleDeleteRoom(roomId) {
    return async (e) => {
      e.preventDefault();
      try {
        const usersResponse = await api.get(`rooms/${roomId}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userIds = usersResponse.data.map((user) => user.id);

        const response = await api.delete(`rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
          toast.success("Room deleted successfully!", { toastId: "room-delete" });

          userIds.forEach((userId) => {
            socket.emit("user_kicked", { roomId, userId });
          });
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    };
  }

  const handleEditRoom = (room) => {
    setEditingRoom({
      ...room,
      assigned_users: typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users) : room.assigned_users,
      deck: room.deck_id,
      ship_layout: room.ship_layout_id,
    });
    setShowEditModal(true);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/rooms/${editingRoom.id}`,
        {
          name: editingRoom.name,
          description: editingRoom.description,
          total_rounds: editingRoom.total_rounds,
          cards_limit_per_round: editingRoom.cards_limit_per_round,
          assigned_users: editingRoom.assigned_users,
          deck: editingRoom.deck,
          ship_layout: editingRoom.ship_layout,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setRooms((prevRooms) => prevRooms.map((room) => (room.id === editingRoom.id ? response.data : room)));
        toast.success("Room updated successfully!");
        setShowEditModal(false);
        setEditingRoom(null);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(error.response?.data?.message || "Failed to update room");
    }
  };

  const renderEditModal = () =>
    showEditModal &&
    editingRoom && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Room: {editingRoom.name}</h3>
            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpdateRoom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Room Name</label>
                <input type="text" value={editingRoom.name} onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Description</label>
                <input
                  type="text"
                  value={editingRoom.description}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Total Rounds</label>
                <input
                  type="number"
                  value={editingRoom.total_rounds}
                  onChange={(e) => setEditingRoom({ ...editingRoom, total_rounds: parseInt(e.target.value) })}
                  min="1"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Cards per Round</label>
                <input
                  type="number"
                  value={editingRoom.cards_limit_per_round}
                  onChange={(e) => setEditingRoom({ ...editingRoom, cards_limit_per_round: parseInt(e.target.value) })}
                  min="1"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Deck</label>
                <Combobox
                  value={decks.find((d) => d.id === editingRoom.deck) || null}
                  onChange={(deck) => {
                    setEditingRoom({
                      ...editingRoom,
                      deck: deck.id,
                      max_users: deck.max_users,
                    });
                  }}
                >
                  <div className="relative">
                    <ComboboxInput
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5"
                      displayValue={(deck) => deck?.name || ""}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Select a deck..."
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                    <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 shadow-xl">
                      {decks.map((deck) => (
                        <ComboboxOption key={deck.id} value={deck} className={({ active }) => `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-50 text-blue-900" : "text-gray-900"}`}>
                          {deck.name}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2">Ship Layout</label>
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
                      className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5"
                      displayValue={(layout) => layout?.name || ""}
                      onChange={(event) => setLayoutQuery(event.target.value)}
                      placeholder="Select a layout..."
                    />
                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <HiChevronUpDown className="h-5 w-5 text-gray-400" />
                    </ComboboxButton>
                    <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white py-2 shadow-xl">
                      {layouts.map((layout) => (
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
              </div>

              <div className="col-span-full">
                <label className="text-gray-700 font-semibold mb-2">Assigned Users</label>
                <Combobox multiple value={editingRoom.assigned_users} onChange={(userIds) => setEditingRoom({ ...editingRoom, assigned_users: userIds })}>
                  <div className="relative">
                    <div className="relative w-full">
                      <ComboboxInput
                        className="w-full rounded-lg border border-gray-300 bg-white py-3.5 pl-4 pr-10 text-sm leading-5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search and select group users..."
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
                              <span className="text-sm text-gray-500">{editingRoom.assigned_users.length} group users selected</span>
                              {editingRoom.assigned_users.length > 0 && (
                                <button onClick={() => setEditingRoom({ ...editingRoom, assigned_users: [] })} className="text-xs text-red-500 hover:text-red-700">
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
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || "",
    }));
  }

  async function handleDeckChange(e) {
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
        toast.error("Error selecting deck. Please try again.", { toastId: "deck-select-error" });
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        max_users: 0,
      }));
    }
  }

  function handleOpenRoom(roomId) {
    navigate(`/rooms/${roomId}`);
  }

  function sortedRooms() {
    let sortableRooms = [...rooms];
    if (sortConfig !== null) {
      sortableRooms.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRooms;
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = sortedRooms().slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(rooms.length / itemsPerPage);

  const filteredDecks = query === "" ? decks : decks.filter((deck) => deck.name.toLowerCase().includes(query.toLowerCase()));

  // Add this with other state declarations
  const [layoutQuery, setLayoutQuery] = useState("");
  const [showLayoutPreview, setShowLayoutPreview] = useState(false);

  // Add this filter function with other filter functions
  const filteredLayouts = layoutQuery === "" ? layouts : layouts.filter((layout) => layout.name.toLowerCase().includes(layoutQuery.toLowerCase()));

  const renderCreateForm = () => (
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
                  placeholder="Search and select group users..."
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
      {showLayoutPreview && (selectedLayout || editingRoom) && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{(selectedLayout || layouts.find((l) => l.id === editingRoom?.ship_layout))?.name} Preview</h3>
              <button onClick={() => setShowLayoutPreview(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <RenderShipBayLayout
                bayCount={selectedLayout?.bay_count || editingRoom?.bay_count}
                baySize={typeof (selectedLayout?.bay_size || editingRoom?.bay_size) === "string" ? JSON.parse(selectedLayout?.bay_size || editingRoom?.bay_size) : selectedLayout?.bay_size || editingRoom?.bay_size}
                bayTypes={typeof (selectedLayout?.bay_types || editingRoom?.bay_types) === "string" ? JSON.parse(selectedLayout?.bay_types || editingRoom?.bay_types) : selectedLayout?.bay_types || editingRoom?.bay_types}
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

  return (
    <div className="container mx-auto p-4">
      <ToastContainer autoClose={2000} />

      {renderCreateForm()}

      {renderEditModal()}

      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Rooms</h3>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}
          />
        </div>
        {rooms.length === 0 ? (
          <p className="text-center text-gray-600">There are no rooms! Let's create one!</p>
        ) : (
          <>
            <div className="space-y-4">
              {currentPageData.map((room, index) => (
                <div key={room.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Left section with room details */}
                  <div className="flex items-start space-x-6 w-full">
                    {/* Room Icon and Status */}
                    <div className="flex flex-col items-center space-y-3 pt-2">
                      <div className={`w-16 h-16 rounded-lg ${room.status === "active" ? "bg-green-500" : room.status === "finished" ? "bg-red-500" : "bg-blue-500"} flex items-center justify-center text-white`}>
                        <span className="text-xl font-medium">{offset + index + 1}</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${room.status === "active" ? "bg-green-100 text-green-800" : room.status === "finished" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                          {room.status}
                        </span>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {room.id} | {room.name}
                        </h3>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <p>{room.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {/* Configuration Info */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center text-gray-600">
                            <BiGrid className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="font-medium">Total Rounds:</span>
                            <span className="ml-2">{room.total_rounds}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <BiCube className="w-4 h-4 text-purple-500 mr-2" />
                            <span className="font-medium">Cards per Round:</span>
                            <span className="ml-2">{room.cards_limit_per_round}</span>
                          </div>
                        </div>

                        {/* Creation Info */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center text-gray-600">
                            <IoCreateOutline className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="font-medium">Created by:</span>
                            <span className="ml-2 text-blue-600">{admins[room.admin_id]?.name}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <IoTimeOutline className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">
                              {new Date(room.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Participation Info */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center text-gray-600">
                            <GiShipBow className="w-4 h-4 text-indigo-500 mr-2" />
                            <span className="font-medium">Max Players:</span>
                            <span className="ml-2">{room.max_users}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MdOutlineGridOn className="w-4 h-4 text-green-500 mr-2" />
                            <span className="font-medium">Assigned Players:</span>
                            <span className="ml-2">{room.assigned_users ? (typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users).length : room.assigned_users.length) : 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right section with action buttons */}
                  <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                    {room.status === "finished" && (
                      <button
                        onClick={() => navigate(`/rooms/${room.id}/detail`)}
                        className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                      >
                        <AiFillEye className="mr-2 h-4 w-4" /> View Detail
                      </button>
                    )}
                    {room.status !== "finished" && (
                      <button
                        onClick={() => handleOpenRoom(room.id)}
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                          room.status === "active" ? "border-gray-300 text-gray-700 bg-gray-50 cursor-not-allowed" : "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                        }`}
                        disabled={room.status === "active"}
                      >
                        <AiFillFolderOpen className="mr-2 h-4 w-4" /> Open
                      </button>
                    )}

                    {room.status !== "active" && (
                      <button onClick={() => handleEditRoom(room)} className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100">
                        <HiPencilAlt className="mr-2 h-4 w-4" /> Edit
                      </button>
                    )}
                    {room.status !== "active" && (
                      <button onClick={(e) => handleDeleteRoom(room.id)(e)} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                        <AiFillDelete className="mr-2 h-4 w-4" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
