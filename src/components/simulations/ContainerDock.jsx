const ContainerDock = ({ id, rows, columns, children, capacityStatus = "normal" }) => {
  const getBgColor = () => {
    switch (capacityStatus) {
      case "warning":
        return "bg-gradient-to-b from-amber-50 to-gray-100";
      case "critical":
        return "bg-gradient-to-b from-red-50 to-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className={`p-2 md:p-3 lg:p-4 rounded-xl shadow-inner overflow-hidden ${getBgColor()}`}>
      <div
        className="grid gap-1 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          maxWidth: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerDock;
