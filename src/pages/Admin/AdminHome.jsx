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
import ConfirmationModal from "../../components/ConfirmationModal";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

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

      await fetchAdmins();
      if (response.data.length > 0) {
        const newPageCount = Math.ceil(response.data.length / itemsPerPage);
        if (currentPage >= newPageCount) {
          setCurrentPage(0);
        }
      } else {
        setCurrentPage(0);
      }
      console.log("Rooms fetched:", response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  async function fetchAdmins() {
    try {
      const response = await api.get("all-admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const adminsMap = {};
      response.data.forEach((admin) => {
        adminsMap[admin.id] = admin;
      });

      setAdmins(adminsMap);
      console.log("Admins fetched:", adminsMap);
    } catch (error) {
      console.error("Error fetching admins:", error);
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
      // Instead of deleting immediately, show the confirmation modal
      setRoomToDelete(roomId);
      setShowDeleteModal(true);
    };
  }

  const confirmDeleteRoom = async () => {
    try {
      const usersResponse = await api.get(`rooms/${roomToDelete}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userIds = usersResponse.data.map((user) => user.id);

      const response = await api.delete(`rooms/${roomToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomToDelete));
        toast.success("Room deleted successfully!", { toastId: "room-delete" });

        userIds.forEach((userId) => {
          socket.emit("user_kicked", { roomId: roomToDelete, userId });
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    } finally {
      setShowDeleteModal(false);
      setRoomToDelete(null);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom({
      ...room,
      assigned_users: typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users) : room.assigned_users,
      deck: room.deck_id,
      ship_layout: room.ship_layout_id,
    });
    setShowEditModal(true);
  };

  // Modify handleUpdateRoom to show confirmation first
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setShowEditModal(false);
    setShowEditConfirmModal(true);
  };

  // New function to handle actual update after confirmation
  const confirmUpdateRoom = async () => {
    try {
      const response = await api.put(
        `/rooms/${editingRoom.id}`,
        {
          name: editingRoom.name,
          description: editingRoom.description,
          total_rounds: editingRoom.total_rounds,
          cards_limit_per_round: editingRoom.cards_limit_per_round,
          cards_must_process_per_round: editingRoom.cards_must_process_per_round,
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
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error(error.response?.data?.message || "Failed to update room");
      // If update fails, reopen the edit modal
      setShowEditModal(true);
    } finally {
      setShowEditConfirmModal(false);
      setEditingRoom(null);
    }
  };

  // Function to cancel the update and reopen edit modal
  const cancelUpdateRoom = () => {
    setShowEditConfirmModal(false);
    setShowEditModal(true);
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

      <CreateRoomForm token={token} decks={decks} layouts={layouts} availableUsers={availableUsers} setRooms={setRooms} refreshRooms={fetchRooms} />

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

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDeleteRoom} title="Delete Room" message="Are you sure you want to delete this room? This action cannot be undone." />

      {/* Confirmation Modal for Edit */}
      <ConfirmationModal isOpen={showEditConfirmModal} onClose={cancelUpdateRoom} onConfirm={confirmUpdateRoom} title="Update Room" message="Are you sure you want to update this room? This will apply all changes you've made." />
    </div>
  );
};

export default AdminHome;
