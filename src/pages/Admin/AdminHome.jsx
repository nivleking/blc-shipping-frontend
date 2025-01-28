import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "./AdminHome.css";
import io from "socket.io-client";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";
import { AiFillDelete, AiFillFolderOpen } from "react-icons/ai";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { HiCheck, HiChevronUpDown, HiDocumentCheck, HiPlus } from "react-icons/hi2";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const AdminHome = () => {
  const { user, token } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState({});
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    deck_id: "",
    max_users: 0,
    bay_size: {},
    bay_count: "",
  });
  const [errors, setErrors] = useState({});
  const [decks, setDecks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [baySize, setBaySize] = useState({ rows: 1, columns: 1 });
  const [bayCount, setBayCount] = useState(1);
  const [isBayConfigured, setIsBayConfigured] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedDeck, setSelectedDeck] = useState(null);

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchDecks();
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

  async function createRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post("rooms", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setRooms((prevRooms) => [...prevRooms, response.data]);
        toast.success("Room created successfully!", { toastId: "room-create" });
        console.log("Room created:", response.data);
        setIsBayConfigured(false);
        setFormData({
          id: "",
          name: "",
          description: "",
          deck_id: "",
          max_users: 0,
          bay_size: {},
          bay_count: "",
        });
      }
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error creating room:", error);
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
          console.log("Room deleted:", roomId);

          userIds.forEach((userId) => {
            socket.emit("user_kicked", userId);
          });
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    };
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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

  const handleBaySizeChange = (e) => {
    const { name, value } = e.target;
    setBaySize((prevSize) => ({
      ...prevSize,
      [name]: parseInt(value),
    }));
  };

  const handleBayCountChange = (e) => {
    setBayCount(parseInt(e.target.value));
  };

  const handleSaveConfig = () => {
    setFormData((prevData) => ({
      ...prevData,
      bay_size: baySize,
      bay_count: bayCount,
    }));
    setShowConfigPopup(false);
    setIsBayConfigured(true);
    toast.success("Ship bay layout saved successfully!", { toastId: "config-save" });
  };

  // Add this filter function before return
  const filteredDecks = query === "" ? decks : decks.filter((deck) => deck.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="container mx-auto p-4">
      <ToastContainer autoClose={2000} />
      <div className="mb-4">
        <form onSubmit={createRoom} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="w-full">
            <h3 className="text-1xl font-bold text-gray-900">Create New Room</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label htmlFor="id" className="block text-gray-700 font-semibold">
                Room ID
              </label>
              <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Room ID" />
              {errors.id && <p className="text-red-500 mt-1">{errors.id[0]}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="name" className="block text-gray-700 font-semibold">
                Room Name
              </label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Room Name" />
              {errors.name && <p className="text-red-500 mt-1">{errors.name[0]}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="description" className="block text-gray-700 font-semibold">
                Room Description
              </label>
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
            <div className="flex flex-col relative">
              <label htmlFor="deck_id" className="block text-gray-700 font-semibold">
                Deck
              </label>
              <Combobox
                value={selectedDeck}
                onChange={(deck) => {
                  setSelectedDeck(deck);
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
                          <div className="px-4 py-3 text-sm text-gray-500">No decks found matching "{query}"</div>
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
              {errors.deck_id && <p className="text-red-500 mt-1">{errors.deck_id[0]}</p>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="max_users" className="block text-gray-700 font-semibold">
                Max Users
              </label>
              <input
                type="number"
                id="max_users"
                name="max_users"
                value={formData.max_users}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                readOnly
                style={{ backgroundColor: "#f9f9f9", cursor: "not-allowed", color: "#666", fontWeight: "bold" }}
              />
            </div>
          </div>
          <div className="flex justify-start space-x-4">
            <button
              type="button"
              onClick={() => setShowConfigPopup(true)}
              className={`p-3 text-white rounded-lg transition duration-300 flex items-center gap-2
    ${isBayConfigured ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}
            >
              {isBayConfigured ? "✓ Edit Ship Bay Layout" : "Ship Bay Layout"}
            </button>
            <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
              Create
            </button>
          </div>
          {errors.bay_size && <p className="text-red-500">{errors.bay_size[0]}</p>}
        </form>
      </div>
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
                <div key={room.id} className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                  <div className="flex-shrink-0">
                    <div
                      // className="bg-green-500 text-white px-2 py-1 rounded-lg transform -skew-x-12 w-12 text-center"
                      className={`${room.status === "active" ? "bg-green-500" : room.status === "finished" ? "bg-red-500" : "bg-blue-500"} text-white px-2 py-1 rounded-lg transform -skew-x-12 w-12 text-center`}
                    >
                      {offset + index + 1}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-lg font-bold">
                      {room.id} | {room.name}
                    </p>
                    <p className="text-gray-400 text-sm">{room.description}</p>
                    <p className="text-gray-400 text-sm">
                      Created by {admins[room.admin_id] && admins[room.admin_id].name} at {new Date(room.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={() => navigate(`/rooms/${room.id}/detail`)} className="p-2 text-center text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg">
                      Detail
                    </button>
                    <button
                      onClick={() => handleOpenRoom(room.id)}
                      className={`p-2 text-center text-white rounded-lg ${room.status === "active" || room.status === "finished" ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                      disabled={room.status === "active" || room.status === "finished"}
                    >
                      <AiFillFolderOpen /> Open
                    </button>
                    <form action="" onSubmit={handleDeleteRoom(room.id)}>
                      <button disabled={room.status === "active"} className={`p-2 text-center text-white rounded-lg ${room.status === "active" ? "bg-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
                        <AiFillDelete /> Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showConfigPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto" style={{ width: "1000px", height: "500px" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Configure Ship</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowConfigPopup(false)} className="p-2 bg-gray-500 text-white rounded">
                  Close
                </button>
                <button onClick={handleSaveConfig} className="p-2 bg-blue-500 text-white rounded">
                  Save
                </button>
              </div>
            </div>
            <div className="flex mb-4">
              <div className="mr-4">
                <label className="block mb-2">Bay Size (Rows x Columns):</label>
                <div className="flex items-center">
                  <input max="7" type="number" name="rows" value={baySize.rows} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded mr-2" />
                  x
                  <input max="8" type="number" name="columns" value={baySize.columns} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded ml-2" />
                </div>
              </div>
              <div>
                <label className="block mb-2">Number of Bays:</label>
                <input max="8" type="number" value={bayCount} onChange={handleBayCountChange} min="1" className="w-12 p-1 border border-gray-300 rounded" />
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ship Layout Preview</h3>
              <RenderShipBayLayout bayCount={bayCount} baySize={baySize} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
