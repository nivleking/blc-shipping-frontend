const PriceTable = ({ priceData, viewMode, port, formatCurrency }) => {
  // Helper to get all ports from price data
  const getPorts = () => {
    const portsSet = new Set();

    if (!priceData) return [];

    Object.keys(priceData).forEach((key) => {
      const parts = key.split("-");
      if (parts.length === 3) {
        portsSet.add(parts[0]); // Origin
        portsSet.add(parts[1]); // Destination
      }
    });

    if (port) portsSet.delete(port);
    const otherPorts = Array.from(portsSet).sort();
    return port ? [port, ...otherPorts] : otherPorts;
  };

  // Helper to group price data by origin
  const groupByOrigin = (data) => {
    const grouped = {};

    if (!data) return {};

    Object.entries(data).forEach(([key, value]) => {
      const parts = key.split("-");
      if (parts.length !== 3) return;

      const [origin, destination, type] = parts;

      if (!grouped[origin]) {
        grouped[origin] = [];
      }

      grouped[origin].push({
        destination,
        type: type.toLowerCase(),
        price: value,
      });
    });

    return grouped;
  };

  // Matrix View
  if (viewMode === "matrix") {
    const ports = getPorts();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Origin / Dest</th>
              {ports.map((destination) => (
                <th
                  key={destination}
                  className={`px-3 py-2 text-center text-xs font-medium tracking-wider border-r
                      ${destination === port ? "bg-blue-100 text-blue-800 uppercase font-bold" : "text-gray-500 uppercase"}`}
                >
                  {destination === port ? `${destination} ★` : destination}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ports.map((origin) => (
              <tr key={origin} className={origin === port ? "bg-blue-50" : ""}>
                <td
                  className={`px-3 py-2 text-xs font-medium border-r 
                      ${origin === port ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-900"}`}
                >
                  {origin === port ? `${origin} (Your Port)` : origin}
                </td>
                {ports.map((destination) => {
                  const dryKey = `${origin}-${destination}-Dry`;
                  const reeferKey = `${origin}-${destination}-Reefer`;
                  const dryPrice = priceData[dryKey];
                  const reeferPrice = priceData[reeferKey];
                  const showDry = dryPrice !== undefined;
                  const showReefer = reeferPrice !== undefined;
                  const isUserPortRoute = origin === port || destination === port;

                  return (
                    <td
                      key={`${origin}-${destination}`}
                      className={`px-3 py-2 text-xs text-right border-r 
                          ${origin === destination ? "bg-gray-100" : isUserPortRoute && origin !== port ? "bg-blue-50" : ""}`}
                    >
                      {origin === destination ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <div className="space-y-1">
                          {showDry && <div className={`${isUserPortRoute ? "font-medium" : ""} text-green-600`}>Dry: {formatCurrency(dryPrice)}</div>}
                          {showReefer && <div className={`${isUserPortRoute ? "font-medium" : ""} text-blue-600`}>Reefer: {formatCurrency(reeferPrice)}</div>}
                          {!showDry && !showReefer && <span className="text-gray-400">No data</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // List View
  else {
    const grouped = groupByOrigin(priceData);
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      if (a[0] === port) return -1;
      if (b[0] === port) return 1;
      return a[0].localeCompare(b[0]);
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEntries.map(([origin, routes]) => (
          <div key={origin} className={`bg-white rounded-lg shadow-sm p-3 ${origin === port ? "ring-2 ring-blue-400" : ""}`}>
            <div className={`font-semibold mb-2 ${origin === port ? "text-blue-700" : "text-gray-800"}`}>{origin === port ? `${origin} (Your Port)` : origin}</div>
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Dest</th>
                  <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-900">{route.destination}</td>
                    <td className={`px-2 py-1 text-center ${route.type === "reefer" ? "text-blue-600" : "text-green-600"}`}>{route.type}</td>
                    <td className="px-2 py-1 text-right font-medium">{formatCurrency(route.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }
};

export default PriceTable;
