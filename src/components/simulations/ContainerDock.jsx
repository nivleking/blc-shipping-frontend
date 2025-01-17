const ContainerDock = ({ id, children }) => {
  return <div className="grid grid-cols-5 grid-rows-3 gap-1 m-2 border border-gray-400">{children}</div>;
};

export default ContainerDock;
