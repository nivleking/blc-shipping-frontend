import { useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { api, socket } from "../../axios/axios";
import "./AdminHome.css";
import EditRoomModal from "../../components/admins/home/EditRoomModal";
import CreateRoomForm from "../../components/admins/home/CreateRoomForm";
import RoomList from "../../components/admins/home/RoomList";
import ConfirmationModal from "../../components/ConfirmationModal";
import useToast from "../../toast/useToast";
import LoadingOverlay from "../../components/LoadingOverlay";

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
  move_cost: 1000000,
  extra_moves_cost: 3500000,
  ideal_crane_split: 2,
  swap_config: {},
};

const AdminHome = () => {
  const { user, token } = useContext(AppContext);
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormState);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const deleteMessages = ["Deleting room..."];

  const editMessages = ["Updating room configuration..."];

  useEffect(() => {
    let interval;
    if (isDeleting || isEditing) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const messages = isDeleting ? deleteMessages : editMessages;
          return (prev + 1) % messages.length;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isDeleting, isEditing, deleteMessages.length, editMessages.length]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await api.get("rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Rooms fetched:", response.data);
      return response.data;
    },
    enabled: !!token,
  });

  const rooms = data?.rooms || [];
  const admins = data?.admins || {};
  const decks = data?.decks || [];
  const layouts = data?.layouts || [];
  const availableUsers = data?.availableUsers || [];

  const refreshRooms = () => {
    queryClient.invalidateQueries(["rooms"]);
  };

  const deleteMutation = useMutation({
    mutationFn: async (roomId) => {
      setShowDeleteModal(false);
      setIsDeleting(true);
      setLoadingMessageIndex(0);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      const usersResponse = await api.get(`rooms/${roomId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userIds = usersResponse.data.map((user) => user.id);

      return api
        .delete(`rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => ({ roomId, userIds }));
    },
    onSuccess: ({ roomId, userIds }) => {
      queryClient.invalidateQueries(["rooms"]);
      showSuccess("Room deleted successfully!");

      userIds.forEach((userId) => {
        socket.emit("user_kicked", { roomId, userId });
      });

      setIsDeleting(false);
      setRoomToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting room:", error);
      showError("Failed to delete room");
      setIsDeleting(false);
      setRoomToDelete(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedFields) => {
      setShowEditConfirmModal(false);
      setIsEditing(true);
      setLoadingMessageIndex(0);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      return api.put(`/rooms/${editingRoom.id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      showSuccess("Room updated successfully!");
      setEditingRoom(null);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating room:", error);
      showError(error.response?.data?.message || "Failed to update room");
      setShowEditModal(true);
      setIsEditing(false);
    },
  });

  function handleDeleteRoom(roomId) {
    return async (e) => {
      e.preventDefault();
      const room = rooms.find((r) => r.id === roomId);

      if (!room) {
        showError("Room not found");
        return;
      }

      if (room.admin_id !== user.id) {
        showError("You can only delete rooms that you created");
        return;
      }
      setRoomToDelete(roomId);
      setShowDeleteModal(true);
    };
  }

  const confirmDeleteRoom = () => {
    deleteMutation.mutate(roomToDelete);
  };

  const handleEditRoom = (room) => {
    if (room.admin_id !== user.id) {
      showError("You can only edit rooms that you created");
      return;
    }

    const currentDeck = decks.find((d) => d.id === room.deck_id);

    setSelectedDeck(currentDeck);
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
    setShowEditModal(false);
    setShowEditConfirmModal(true);
  };

  const confirmUpdateRoom = () => {
    // Extract dock warehouse costs from editingRoom
    const dockCosts = editingRoom.dock_warehouse_costs || {};

    // Format in the way backend validation expects
    const updatedFields = {
      name: editingRoom.name,
      description: editingRoom.description,
      total_rounds: parseInt(editingRoom.total_rounds),
      cards_limit_per_round: parseInt(editingRoom.cards_limit_per_round),
      cards_must_process_per_round: parseInt(editingRoom.cards_must_process_per_round),
      move_cost: parseInt(editingRoom.move_cost),
      restowage_cost: parseInt(editingRoom.restowage_cost || 3500000),
      dock_warehouse_costs: {
        dry: {
          committed: parseInt(dockCosts.dry?.committed || 8000000),
          non_committed: parseInt(dockCosts.dry?.non_committed || 4000000),
        },
        reefer: {
          committed: parseInt(dockCosts.reefer?.committed || 15000000),
          non_committed: parseInt(dockCosts.reefer?.non_committed || 9000000),
        },
        default: parseInt(dockCosts.default || 9000000),
      },
      swap_config: typeof editingRoom.swap_config === "string" ? JSON.parse(editingRoom.swap_config) : editingRoom.swap_config || {},
      assigned_users: editingRoom.assigned_users,
      deck: editingRoom.deck,
      ship_layout: editingRoom.ship_layout,
    };

    console.log("Updating room with data:", updatedFields);

    updateMutation.mutate(updatedFields);
  };

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
        showError("Error selecting deck. Please try again.");
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        max_users: 0,
      }));
    }
  }

  function handleOpenRoom(roomId) {
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      showError("Room not found");
      return;
    }

    // Check if the current user is the creator admin
    if (room.admin_id !== user.id) {
      showError("You can only manage rooms that you created");
      return;
    }

    navigate(`/rooms/${roomId}`);
  }

  function sortedRooms() {
    // Create a copy of rooms to avoid mutation
    const sortedData = [...rooms];

    // Status priority mapping (lower number = higher priority)
    const statusPriority = {
      active: 1,
      created: 2,
      finished: 3,
    };

    return sortedData.sort((a, b) => {
      // First sort by status priority
      const statusA = a.status.toLowerCase();
      const statusB = b.status.toLowerCase();

      const priorityA = statusPriority[statusA] || 999; // Unknown statuses get lowest priority
      const priorityB = statusPriority[statusB] || 999;

      // If statuses are different, sort by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If statuses are the same, use the existing sort config
      const key = sortConfig.key;
      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = sortedRooms().slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(rooms.length / itemsPerPage);

  if (isLoading) {
    return <div className="text-center p-8">Loading rooms data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error loading rooms: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {isDeleting && <LoadingOverlay messages={deleteMessages} currentMessageIndex={loadingMessageIndex} title="Deleting Room" />}

      {isEditing && <LoadingOverlay messages={editMessages} currentMessageIndex={loadingMessageIndex} title="Updating Room" />}

      <CreateRoomForm token={token} decks={decks} layouts={layouts} availableUsers={availableUsers} refreshRooms={refreshRooms} />

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
