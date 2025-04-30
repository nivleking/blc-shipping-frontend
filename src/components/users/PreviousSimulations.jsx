import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaSortAmountDown, FaExternalLinkAlt, FaChartLine } from "react-icons/fa";

const PreviousSimulations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dummy data for simulations - this would come from an API in a real implementation
  const simulationsData = [
    {
      id: "sim123",
      roomId: "456",
      roomName: "Pacific Routes Simulation",
      date: "2025-03-15",
      status: "finished",
      rounds: 4,
      totalRevenue: 45600000,
      netProfit: 32450000,
      rank: 2,
      participants: 16,
      portAssigned: "BPN",
    },
    {
      id: "sim456",
      roomId: "789",
      roomName: "Atlantic Trade Routes",
      date: "2025-02-28",
      status: "finished",
      rounds: 6,
      totalRevenue: 67800000,
      netProfit: 42300000,
      rank: 5,
      participants: 12,
      portAssigned: "MKS",
    },
    {
      id: "sim789",
      roomId: "101",
      roomName: "Asia-Europe Corridor",
      date: "2025-02-10",
      status: "finished",
      rounds: 8,
      totalRevenue: 98500000,
      netProfit: 71200000,
      rank: 1,
      participants: 8,
      portAssigned: "JYP",
    },
    {
      id: "sim101",
      roomId: "202",
      roomName: "Americas Connection",
      date: "2025-01-20",
      status: "finished",
      rounds: 5,
      totalRevenue: 54300000,
      netProfit: 38900000,
      rank: 3,
      participants: 10,
      portAssigned: "MDN",
    },
    {
      id: "sim202",
      roomId: "303",
      roomName: "Middle East Networks",
      date: "2025-01-05",
      status: "finished",
      rounds: 6,
      totalRevenue: 76100000,
      netProfit: 52400000,
      rank: 2,
      participants: 14,
      portAssigned: "SBY",
    },
  ];

  // Filter simulations based on search term and filter status
  const filteredSimulations = simulationsData.filter((sim) => {
    const matchesSearch = sim.roomName.toLowerCase().includes(searchTerm.toLowerCase()) || sim.portAssigned.toLowerCase().includes(searchTerm.toLowerCase()) || sim.roomId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || sim.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Handle viewing simulation details (placeholder function)
  const viewSimulationDetails = (simulationId) => {
    // This would navigate to a detailed view of the simulation
    console.log(`View details for simulation ${simulationId}`);
    // navigate(`/simulation-details/${simulationId}`);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation History</h1>
        <p className="text-gray-600">View and analyze your past shipping simulations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Simulations</h3>
          <p className="text-3xl font-bold text-gray-900">{simulationsData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Best Ranking</h3>
          <p className="text-3xl font-bold text-gray-900">
            1<span className="text-sm text-gray-500 ml-1">of 8</span>
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(342300000)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Average Net Profit</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(47450000)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search simulations..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 pl-10 pr-8 py-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="finished">Finished</option>
                <option value="in-progress">In Progress</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 pl-10 pr-8 py-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="revenue-desc">Highest Revenue</option>
                <option value="rank-asc">Best Ranking</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSortAmountDown className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Simulation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Port
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rounds
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ranking
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSimulations.map((simulation) => (
                <tr key={simulation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{simulation.roomName}</div>
                        <div className="text-sm text-gray-500">Room ID: {simulation.roomId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(simulation.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{simulation.portAssigned}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{simulation.rounds}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(simulation.totalRevenue)}</div>
                    <div className="text-sm text-gray-500">Net: {formatCurrency(simulation.netProfit)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${simulation.rank === 1 ? "bg-green-100 text-green-800" : simulation.rank <= 3 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {simulation.rank} of {simulation.participants}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => viewSimulationDetails(simulation.id)} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <FaExternalLinkAlt size={12} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 flex items-center">
                        <FaChartLine size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No simulations found state */}
        {filteredSimulations.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaSearch className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No simulations found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSimulations.length}</span> of <span className="font-medium">{filteredSimulations.length}</span> results
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default PreviousSimulations;
