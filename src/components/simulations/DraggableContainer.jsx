import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DraggableContainer = ({ id, text, style, isDragging, color }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : "auto",
    position: isDragging ? "fixed" : "relative",
    backgroundColor: color,
    color: color === "blue" ? "white" : "black",
  };

  return (
    <div ref={setNodeRef} style={{ ...defaultStyle, ...style }} {...listeners} {...attributes} className={`p-2 m-1 text-white rounded cursor-move shadow ${isDragging ? "dragging" : ""}`}>
      {text}
    </div>
  );
};

export default DraggableContainer;
