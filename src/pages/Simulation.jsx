import React, { useState, useEffect } from "react";

const Simulation = () => {
  const [shipLayout, setShipLayout] = useState([]);
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    // Dummy data
    const dummyShipData = [
      [
        [1, 0, 2],
        [0, 3, 0],
        [4, 0, 5],
      ],
      [
        [0, 6, 0],
        [7, 0, 8],
        [0, 9, 0],
      ],
      [
        [10, 0, 11],
        [0, 12, 0],
        [13, 0, 14],
      ],
    ];
    const dummyContainerData = [
      { id_container: 1, location: "SBY" },
      { id_container: 2, location: "MKS" },
      { id_container: 3, location: "BPP" },
      { id_container: 4, location: "JYP" },
      { id_container: 5, location: "MDN" },
      { id_container: 6, location: "SBY" },
      { id_container: 7, location: "MKS" },
      { id_container: 8, location: "BPP" },
      { id_container: 9, location: "JYP" },
      { id_container: 10, location: "MDN" },
      { id_container: 11, location: "SBY" },
      { id_container: 12, location: "MKS" },
      { id_container: 13, location: "BPP" },
      { id_container: 14, location: "JYP" },
    ];

    setShipLayout(dummyShipData);
    setContainers(dummyContainerData);
  }, []);

  const renderTableHeader = () => {
    return (
      <tr>
        {shipLayout.map((_, index) => (
          <th key={index} colSpan={3} className="border px-4 py-2 text-center bg-gray-200">
            BAY {index} {index === 1 || index === 2 ? "REEF" : "DRY"}
          </th>
        ))}
      </tr>
    );
  };

  const renderTableBody = () => {
    return shipLayout.map((deck, a) => (
      <tr key={a}>
        {deck.map((row, b) =>
          row.map((containerId, c) => {
            const cellId = `${a}${b}${c}`;
            const container = containers.find((cont) => cont.id_container === containerId);

            return (
              <td key={cellId} className="border px-4 py-2 text-center">
                <div className="id font-bold">{cellId}</div>
                {container ? <div style={{ color: getColor(container.location) }}>{container.id_container}</div> : "-"}
              </td>
            );
          })
        )}
      </tr>
    ));
  };

  const getColor = (location) => {
    switch (location) {
      case "SBY":
        return "red";
      case "MKS":
        return "blue";
      case "BPP":
        return "brown";
      case "JYP":
        return "green";
      case "MDN":
        return "gray";
      default:
        return "black";
    }
  };

  return (
    <div className="container mx-auto mt-5">
      <table className="table-auto border-collapse w-full">
        <thead>{renderTableHeader()}</thead>
        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  );
};

export default Simulation;
