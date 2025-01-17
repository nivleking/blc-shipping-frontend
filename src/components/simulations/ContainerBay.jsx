const ContainerBay = ({ id, rows, columns, children }) => {
  return (
    <div
      className="grid gap-1 m-2 border border-gray-400 rounded shadow-sm"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};

export default ContainerBay;
