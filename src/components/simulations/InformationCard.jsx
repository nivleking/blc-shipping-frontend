const InformationCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
    {/* Introduction */}
    <div className="border-l-4 border-blue-500 pl-4">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Sales Call Card Generation Guide</h2>
      <p className="text-gray-600">This form helps you create balanced sales call cards for each port in your simulation. These cards represent shipping contracts that players need to fulfill.</p>
    </div>

    {/* Core Parameters */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Core Parameters</h3>

      <div className="grid grid-cols-1 gap-4">
        {/* Ports Parameter */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">1. Total Ports (4-8)</h4>
          <p className="text-gray-600 mb-2">Choose how many ports will be active in the game.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Example:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>4 ports: SBY, MKS, MDN, JYP (Standard Game)</li>
              <li>6 ports: Above + BPN, BKS (More Complex)</li>
            </ul>
          </div>
        </div>

        {/* Revenue Parameter */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">2. Revenue Per Port (Default: 250M)</h4>
          <p className="text-gray-600 mb-2">Total revenue that will be distributed among sales cards in each port.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Example with 250M per port:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Card 1: 100M (Large Contract)</li>
              <li>Card 2: 75M (Medium Contract)</li>
              <li>Card 3: 75M (Medium Contract)</li>
              <li>Total = 250M per port</li>
            </ul>
          </div>
        </div>

        {/* Container Quantity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">3. Containers Per Port (Default: 15)</h4>
          <p className="text-gray-600 mb-2">Total containers that will be distributed across sales cards in each port.</p>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm">Example with 15 containers:</p>
            <ul className="list-disc pl-4 text-sm text-gray-600">
              <li>Card 1: 6 containers</li>
              <li>Card 2: 5 containers</li>
              <li>Card 3: 4 containers</li>
              <li>Total = 15 containers per port</li>
            </ul>
          </div>
        </div>

        {/* Standard Deviation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800">4. Standard Deviation Settings</h4>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-sm">Quantity SD (Default: 1)</p>
              <p className="text-sm text-gray-600">Controls variation in container numbers:</p>
              <ul className="list-disc pl-4 text-xs text-gray-600">
                <li>Low (0.5): 4,5,6 containers</li>
                <li>High (2): 2,7,6 containers</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-sm">Revenue SD (Default: 500k)</p>
              <p className="text-sm text-gray-600">Controls price variation:</p>
              <ul className="list-disc pl-4 text-xs text-gray-600">
                <li>Low: Similar prices</li>
                <li>High: Very different prices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Example Generated Card */}
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-gray-800 mb-2">Sample Generated Card</h3>
      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm">
          <span className="font-medium">Route:</span> SBY → MKS
        </p>
        <p className="text-sm">
          <span className="font-medium">Type:</span> Dry Container
        </p>
        <p className="text-sm">
          <span className="font-medium">Quantity:</span> 5 containers
        </p>
        <p className="text-sm">
          <span className="font-medium">Revenue:</span> Rp 75.000.000
        </p>
        <p className="text-sm">
          <span className="font-medium">Revenue/Container:</span> Rp 15.000.000
        </p>
      </div>
    </div>

    {/* Tips */}
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-medium text-green-800 mb-2">Recommendations</h3>
      <ul className="list-disc pl-4 text-sm text-green-700">
        <li>Start with 4 ports for new players</li>
        <li>Use 250M revenue and 15 containers for balanced gameplay</li>
        <li>Keep standard deviations low for predictable outcomes</li>
        <li>Increase values gradually as players gain experience</li>
      </ul>
    </div>
  </div>
);

export default InformationCard;
