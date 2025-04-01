const ContainerBay = ({ id, rows, columns, children }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-xl shadow-inner">
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
