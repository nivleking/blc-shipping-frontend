import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { api, socket } from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminHome.css";
import EditRoomModal from "../../components/admins/home/EditRoomModal";
import CreateRoomForm from "../../components/admins/home/CreateRoomForm";
import RoomList from "../../components/admins/home/RoomList";

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
  const [decks, setDecks] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const [selectedDeck, setSelectedDeck] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

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

  return (
    <div className="container mx-auto p-4">
      <ToastContainer autoClose={2000} />

      <CreateRoomForm token={token} decks={decks} layouts={layouts} availableUsers={availableUsers} setRooms={setRooms} />

      <EditRoomModal
        showEditModal={showEditModal}
        editingRoom={editingRoom}
        setEditingRoom={setEditingRoom}
        setShowEditModal={setShowEditModal}
        layouts={layouts}
        availableUsers={availableUsers}
        decks={decks}
        handleUpdateRoom={handleUpdateRoom}
        selectedDeck={selectedDeck}
        setSelectedDeck={setSelectedDeck}
        handleDeckChange={handleDeckChange}
      />

      <RoomList
        rooms={rooms}
        currentPageData={currentPageData}
        offset={offset}
        user={user}
        admins={admins}
        pageCount={pageCount}
        currentPage={currentPage}
        handlePageClick={handlePageClick}
        handleOpenRoom={handleOpenRoom}
        handleEditRoom={handleEditRoom}
        handleDeleteRoom={handleDeleteRoom}
      />
    </div>
  );
};

export default AdminHome;
