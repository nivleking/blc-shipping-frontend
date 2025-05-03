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
    <div className={`p-1 shadow-inner max-w-full`}>
      <div
        className="grid gap-1 auto-rows-[50px]"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(60px, 65px))`,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerDock;
