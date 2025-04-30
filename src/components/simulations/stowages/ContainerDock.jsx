const ContainerDock = ({ id, rows, columns, children, capacityStatus = "normal" }) => {
  const getBgColor = () => {
    switch (capacityStatus) {
      case "warning":
        return "bg-gradient-to-b from-amber-50 to-gray-100";
      case "critical":
        return "bg-gradient-to-b from-red-50 to-gray-100";
      case "new":
        return "bg-gradient-to-b from-green-50 to-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className={`p-1 shadow-inner ${getBgColor()}`}>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, 50px)`,
          gridTemplateRows: `repeat(${rows}, 50px)`,
          width: "max-content", 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerDock;
