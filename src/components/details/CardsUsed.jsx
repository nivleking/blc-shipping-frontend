import React, { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";

const CardsUsed = ({ cards, ports = ["JYP", "SBY", "MKS", "MDN"], formatIDR }) => {
  const [selectedPort, setSelectedPort] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp");

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="text-gray-500" />
          <span className="text-sm text-gray-600">Filters:</span>
        </div>

        <select className="form-select rounded-lg border-gray-300 text-sm" value={selectedPort} onChange={(e) => setSelectedPort(e.target.value)}>
          <option value="all">All Ports</option>
          {ports.map((port) => (
            <option key={port} value={port}>
              {port}
            </option>
          ))}
        </select>

        <select className="form-select rounded-lg border-gray-300 text-sm" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
          <option value="all">All Weeks</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
          <option value="3">Week 3</option>
          <option value="4">Week 4</option>
        </select>

        <select className="form-select rounded-lg border-gray-300 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="timestamp">Latest First</option>
          <option value="revenue">Highest Revenue</option>
          <option value="containers">Most Containers</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700">Total Cards</h3>
          <p className="text-2xl font-bold text-blue-800">120</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700">Acceptance Rate</h3>
          <p className="text-2xl font-bold text-green-800">75%</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-700">Total Revenue</h3>
          <p className="text-2xl font-bold text-yellow-800">{formatIDR(2500000000)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-700">Total Containers</h3>
          <p className="text-2xl font-bold text-purple-800">360</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Card */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Week 1</span>
              <h3 className="text-lg font-semibold mt-2">Card #1234</h3>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full 
              ${true ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {true ? "Accepted" : "Rejected"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Origin</span>
              <span className="font-medium">JYP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Destination</span>
              <span className="font-medium">MDN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type</span>
              <span className="font-medium">Reefer</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium text-green-600">{formatIDR(45000000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Player</span>
              <span className="font-medium">John Doe</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{new Date("2024-03-20T10:00:00").toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* More cards would be mapped here */}
      </div>
    </div>
  );
};

export default CardsUsed;
