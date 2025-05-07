import React, { useState, useEffect, useContext } from "react";
import { TbCrane } from "react-icons/tb";

const Stevedoring = ({}) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-4">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <TbCrane className="text-blue-600" />
        Container Logistics & Stevedoring
      </h3>
      <div className="space-y-4 text-gray-600">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border-l-4 border-blue-500 mb-3">
          <p className="font-medium text-blue-800">Stevedoring is the heart of maritime logistics</p>
          <p className="text-xs text-blue-700">The process of loading and unloading containers between ships and shore</p>
        </div>

        <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-1">What is Stevedoring?</h4>
        <p>
          Stevedoring is the process of loading containers onto ships and unloading them from ships using specialized equipment like gantry cranes. This critical operation involves transferring containers between the ship and shore (dock,
          truck, or rail).
        </p>

        <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-1 mt-3">The Stevedoring Challenge</h4>
        <p>Poor stowage planning leads to costly "restowage" - having to temporarily unload containers to access others beneath them. This is one of the biggest challenges in container shipping operations.</p>

        <div className="mt-3 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
          <p className="font-medium">Strategic Container Stacking</p>
          <p className="text-xs">Stack containers with their destination ports in mind! Containers destined for the next port should be accessible without moving containers bound for later ports.</p>
        </div>

        <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-1 mt-3">In BLC Shipping Simulation</h4>
        <p>The simulation focuses on stevedoring challenges, requiring you to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Plan container placement strategically based on destination ports</li>
          <li>Minimize costly restowage operations</li>
          <li>Balance container loading with revenue optimization</li>
          <li>Manage different container types (dry and refrigerated/reefer)</li>
        </ul>
      </div>
    </div>
  );
};

export default Stevedoring;
