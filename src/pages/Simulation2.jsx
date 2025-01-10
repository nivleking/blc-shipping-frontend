import { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import api from "./../axios/axios";
import { CSS } from "@dnd-kit/utilities";

const DraggableContainer = ({ id, text, style }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={{ ...defaultStyle, ...style }} {...listeners} {...attributes} className="p-2 m-1 bg-blue-400 text-white rounded cursor-move shadow">
      {text}
    </div>
  );
};

const DroppableCell = ({ id, children, coordinates }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : "white",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="h-16 w-16 border border-gray-300 flex items-center justify-center rounded shadow-sm">
      <span style={{ position: "absolute", top: "2px", left: "2px", fontSize: "10px", color: "gray" }}>{coordinates}</span>
      {children}
    </div>
  );
};

const ContainerBay = ({ id, rows, columns, children }) => {
  return (
    <div
      className="grid gap-1 m-2 border border-gray-400"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};

const ContainerDocks = ({ id, children }) => {
  return <div className="grid grid-cols-5 grid-rows-3 gap-1 m-2 border border-gray-400">{children}</div>;
};

const Simulation2 = () => {
  const [droppedItems, setDroppedItems] = useState([
    { id: "box1", area: "docks-0" },
    { id: "box2", area: "docks-1" },
    { id: "box3", area: "docks-2" },
  ]);

  const [baySize, setBaySize] = useState({ rows: 3, columns: 3 });
  const [bayCount, setBayCount] = useState(2);
  const [bayData, setBayData] = useState([]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDroppedItems((prevItems) => prevItems.map((item) => (item.id === active.id ? { ...item, area: over.id } : item)));
      console.log(`Dropped item: ${active.id} into ${over.id}`);

      try {
        await api.get("/moveDragMe", {
          // itemId: active.id,
          // from: droppedArea,
          // to: over.id,
        });
        console.log("API call successful");
      } catch (error) {
        console.error("API call failed", error);
      }
    }
  };

  const handleBaySizeChange = (e) => {
    const { name, value } = e.target;
    setBaySize((prevSize) => ({ ...prevSize, [name]: parseInt(value) }));
  };

  const handleBayCountChange = (e) => {
    setBayCount(parseInt(e.target.value));
  };

  useEffect(() => {
    const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
      return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
        return Array.from({ length: baySize.columns }).map((_, colIndex) => {
          const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
          const item = droppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });
    });
    setBayData(newBayData);
    console.log("Bay Data:", newBayData);
  }, [droppedItems, baySize, bayCount]);

  return (
    <>
      <div className="p-5 border-b border-gray-400">
        <h4 className="text-lg font-semibold mb-4">Configure Ship</h4>
        <div className="flex mb-4">
          <div className="mr-4">
            <label className="block mb-2">Bay Size (Rows x Columns):</label>
            <div className="flex items-center">
              <input max="7" type="number" name="rows" value={baySize.rows} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded mr-2" />
              x
              <input max="8" type="number" name="columns" value={baySize.columns} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded ml-2" />
            </div>
          </div>
          <div>
            <label className="block mb-2">Number of Bays:</label>
            <input max="10" type="number" value={bayCount} onChange={handleBayCountChange} min="1" className="w-12 p-1 border border-gray-300 rounded" />
          </div>
        </div>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col flex-1 overflow-x-auto overflow-y-hidden p-5 h-screen w-screen">
          <h4 className="text-lg font-semibold mb-4">Ship</h4>
          <div className="flex gap-5 overflow-x-auto">
            {Array.from({ length: bayCount }).map((_, bayIndex) => (
              <div key={`bay-${bayIndex}`}>
                <h5 className="text-center text-md font-medium mb-2">Bay {bayIndex + 1}</h5>
                <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
                  {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                    const rowIndex = Math.floor(cellIndex / baySize.columns);
                    const colIndex = cellIndex % baySize.columns;
                    const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                    return (
                      <DroppableCell key={`bay-${bayIndex}-${cellIndex}`} id={`bay-${bayIndex}-${cellIndex}`} coordinates={coordinates}>
                        {droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`) && (
                          <DraggableContainer id={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id} text={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id} />
                        )}
                      </DroppableCell>
                    );
                  })}
                </ContainerBay>
              </div>
            ))}
          </div>
          <h4 className="text-lg font-semibold mt-8 mb-4">Docks</h4>
          <div className="flex flex-col items-start">
            <ContainerDocks id="docks">
              {Array.from({ length: 15 }).map((_, index) => (
                <DroppableCell key={`docks-${index}`} id={`docks-${index}`}>
                  {droppedItems.find((item) => item.area === `docks-${index}`) && (
                    <DraggableContainer id={droppedItems.find((item) => item.area === `docks-${index}`).id} text={droppedItems.find((item) => item.area === `docks-${index}`).id} />
                  )}
                </DroppableCell>
              ))}
            </ContainerDocks>
          </div>
        </div>
      </DndContext>
    </>
  );
};

export default Simulation2;
