const ContainerBay = ({ id, rows, columns, children, hasRestowageIssue = false }) => {
  return (
    <div
      className={`
      p-1 shadow-inner
      ${hasRestowageIssue ? "bg-red-50" : "bg-gray-100"}
    `}
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(50px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 50px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerBay;
