const HeaderCards = ({ revenue, penalties, rank, section, port, formatIDR }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Total Revenue</p>
            <h3 className="text-2xl font-bold">{formatIDR(revenue)}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Penalties Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Penalties</p>
            <h3 className="text-2xl font-bold">{formatIDR(penalties)}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rank Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Current Rank</p>
            <h3 className="text-2xl font-bold">#{rank}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Section Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Section</p>
            <h3 className="text-2xl font-bold">Section {section} - Week 1</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
      {/* Section Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Port</p>
            <h3 className="text-2xl font-bold">{port}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderCards;
