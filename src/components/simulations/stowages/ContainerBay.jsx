const ContainerBay = ({ id, rows, columns, children, hasRestowageIssue = false }) => {
  return (
    <div
      className={`
      p-4 rounded-xl shadow-inner
      ${hasRestowageIssue ? "bg-red-50" : "bg-gray-100"}
    `}
    >
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(100px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 100px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerBay;
