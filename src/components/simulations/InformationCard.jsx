const InformationCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    <div className="flex items-center space-x-2 mb-4">
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
      </svg>
      <h2 className="text-lg font-semibold text-gray-800">Configuration Guide</h2>
    </div>

    <div className="space-y-4 text-sm text-gray-600">
      <div>
        <h3 className="font-medium text-gray-800 mb-1">What is this form?</h3>
        <p>This configuration panel allows you to generate sales call cards with varying properties for your shipping simulation. Each generated card represents a potential shipping contract with specific requirements and rewards.</p>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-1">Key Parameters</h3>
        <ul className="list-disc pl-4 space-y-2">
          <li>
            <span className="font-medium">Total Ports:</span> Determines how many unique ports will participate in the simulation. Each port will receive its own set of sales call cards.
          </li>
          <li>
            <span className="font-medium">Revenue Configuration:</span> Sets the maximum total revenue potential for each port. The algorithm will distribute this amount across generated sales calls.
          </li>
          <li>
            <span className="font-medium">Container Quantity:</span> Defines how many containers will be available at each port. Higher numbers mean more complex logistics management.
          </li>
          <li>
            <span className="font-medium">Standard Deviation:</span>
            <ul className="list-disc pl-4 mt-1">
              <li>
                <span className="italic">Quantity SD:</span> Controls the variation in container numbers between sales calls. Higher values create more diverse container requirements.
              </li>
              <li>
                <span className="italic">Revenue SD:</span> Affects the spread of revenue values. Higher values result in more varied contract values.
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-1">Pro Tips</h3>
        <ul className="list-disc pl-4 space-y-1 text-blue-700">
          <li>Use lower standard deviations for more balanced gameplay</li>
          <li>Higher container quantities increase game complexity</li>
          <li>Balance revenue across ports for fair competition</li>
        </ul>
      </div>
    </div>
  </div>
);

export default InformationCard;
