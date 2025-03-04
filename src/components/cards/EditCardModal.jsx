import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { api } from "../../axios/axios";
import { toast } from "react-toastify";
import { FaShip } from "react-icons/fa";

const EditCardModal = ({ isOpen, onClose, card, formatIDR, onCardUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    priority: "",
    origin: "",
    destination: "",
    quantity: 1,
    revenue: 0,
  });
  const [availablePorts, setAvailablePorts] = useState([]);

  useEffect(() => {
    if (card) {
      setFormData({
        type: card.type || "dry",
        priority: card.priority || "Committed",
        origin: card.origin || "",
        destination: card.destination || "",
        quantity: card.quantity || 1,
        revenue: card.revenue || 0,
      });

      fetchAvailablePorts();
    }
  }, [card]);

  const fetchAvailablePorts = async () => {
    try {
      const validPorts = ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"];
      setAvailablePorts(validPorts);
    } catch (error) {
      console.error("Error fetching ports:", error);
      toast.error("Failed to fetch available ports");
    }
  };

  const getAvailableDestinations = () => {
    return availablePorts.filter((port) => port !== formData.origin);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "revenue" ? Number(value) : value,
    }));
  };

  const calculateRevenuePerContainer = () => {
    return formData.quantity > 0 ? Math.round(formData.revenue / formData.quantity) : 0;
  };

  const updateRevenueFromPerContainer = (perContainer) => {
    const newRevenue = perContainer * formData.quantity;
    setFormData((prev) => ({
      ...prev,
      revenue: newRevenue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send update request to API
      await api.put(`/cards/${card.id}`, formData);

      toast.success("Card updated successfully");

      // Notify parent component to refresh card data
      if (onCardUpdated) {
        onCardUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error(error.response?.data?.message || "Failed to update card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const revenuePerContainer = calculateRevenuePerContainer();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                      <FaShip className="text-blue-500 text-xl mr-2" />
                      <DialogTitle as="h3" className="text-xl font-bold text-gray-800">
                        Edit Sales Call Card #{card?.id}
                      </DialogTitle>
                    </div>
                  </div>

                  {/* Main Form Content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Container Type Selection - Now editable */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Container Type</label>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input type="radio" name="type" value="dry" checked={formData.type === "dry"} onChange={handleChange} className="form-radio h-5 w-5 text-blue-600" />
                            <span className="ml-2 text-gray-700">Dry</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input type="radio" name="type" value="reefer" checked={formData.type === "reefer"} onChange={handleChange} className="form-radio h-5 w-5 text-blue-600" />
                            <span className="ml-2 text-gray-700">Reefer</span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">Note: Changing container type will affect all containers in this sales call.</p>
                      </div>

                      {/* Priority Level */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                          <option value="Committed">Committed</option>
                          <option value="Non-Committed">Non-Committed</option>
                        </select>
                      </div>

                      {/* Ports Section */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Origin Port */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Origin Port</label>
                          <select name="origin" value={formData.origin} onChange={handleChange} required className="w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                            <option value="">Select Origin Port</option>
                            {availablePorts.map((port) => (
                              <option key={port} value={port}>
                                {port}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Destination Port */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Destination Port</label>
                          <select
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            required
                            disabled={!formData.origin}
                            className={`w-full p-3 bg-gray-50 border-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors
                            ${!formData.origin ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <option value="">Select Destination Port</option>
                            {formData.origin &&
                              getAvailableDestinations().map((port) => (
                                <option key={port} value={port}>
                                  {port}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Container Details Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">Container Details</h4>
                        <div className="grid grid-cols-3 gap-6">
                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              value={formData.quantity}
                              onChange={(e) => {
                                handleChange(e);
                                // Update revenue to maintain revenue per container
                                const newQuantity = parseInt(e.target.value) || 0;
                                const newRevenue = newQuantity * revenuePerContainer;
                                setFormData((prev) => ({ ...prev, revenue: newRevenue }));
                              }}
                              min="1"
                              required
                              className="w-full p-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Revenue per Container */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Revenue/Container</label>
                            <input
                              type="number"
                              value={revenuePerContainer}
                              onChange={(e) => updateRevenueFromPerContainer(parseInt(e.target.value) || 0)}
                              min="0"
                              required
                              className="w-full p-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            <div className="text-xs text-gray-500 mt-1">{formatIDR(revenuePerContainer)}</div>
                          </div>

                          {/* Total Revenue */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Total Revenue</label>
                            <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} min="0" required className="w-full p-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500" />
                            <div className="text-xs text-gray-500 mt-1">{formatIDR(formData.revenue)}</div>
                          </div>
                        </div>

                        {/* Revenue Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Revenue Summary</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {formData.quantity} × {formatIDR(revenuePerContainer)} per container
                            </span>
                            <span className="text-base font-bold text-blue-600">{formatIDR(formData.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`py-2 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditCardModal;
