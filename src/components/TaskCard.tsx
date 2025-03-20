import { useState, useCallback, memo } from 'react';
import { cn } from '../utils/cn';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

function TaskCard({ 
  id, 
  text, 
  completed, 
  onToggle, 
  onDelete,
  onEdit
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  
  // Setup sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  // Apply styles for dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    cursor: isDragging ? 'grabbing' : undefined
  };
  
  // Memoize event handlers to prevent unnecessary rerenders
  const handleToggle = useCallback((e: React.MouseEvent | React.ChangeEvent) => {
    // Stop propagation to prevent the drag from starting
    e.stopPropagation();
    onToggle(id);
  }, [id, onToggle]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent the drag from starting
    e.stopPropagation();
    onDelete(id);
  }, [id, onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    // Stop propagation to prevent the drag from starting
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    if (editText.trim() !== '') {
      onEdit(id, editText.trim());
      setIsEditing(false);
    }
  }, [editText, id, onEdit]);

  const handleCancel = useCallback(() => {
    setEditText(text);
    setIsEditing(false);
  }, [text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Update editText when text prop changes
  if (text !== editText && !isEditing) {
    setEditText(text);
  }

  return (
    <li 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 rounded transition-all duration-200",
        "bg-gray-50 dark:bg-gray-700",
        "hover:shadow-md",
        isDragging ? "shadow-lg" : "",
        !isEditing ? "cursor-grab touch-none" : ""
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      {...(!isEditing ? listeners : {})}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={editText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 px-2 py-1 rounded border",
              "border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-600",
              "text-gray-800 dark:text-gray-200",
              "focus:outline-none focus:ring-1 focus:ring-primary-500"
            )}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              aria-label="Save edits"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Cancel editing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-grow">
            {/* Drag indicator icon - original style */}
            <div 
              className={cn(
                "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
                "transition-all duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              aria-label="Drag to reorder"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
            
            <input
              type="checkbox"
              checked={completed}
              onChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "h-5 w-5 transition-colors cursor-pointer",
                "text-primary-600 focus:ring-primary-500 dark:bg-gray-600 accent-primary-600"
              )}
              aria-label={`Mark "${text}" as ${completed ? 'incomplete' : 'complete'}`}
            />
            <span className={cn(
              "transition-colors",
              completed 
                ? "line-through text-gray-400 dark:text-gray-500" 
                : "text-gray-800 dark:text-gray-200"
            )}>
              {text}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleEdit}
              className={cn(
                "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
                "transition-all duration-200 cursor-pointer",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              aria-label={`Edit task: ${text}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className={cn(
                "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
                "transition-all duration-200 cursor-pointer",
                isHovered ? "scale-110" : "scale-100"
              )}
              aria-label={`Delete task: ${text}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  );
}

// Use memo to prevent unnecessary re-renders when props haven't changed
export default memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.text === nextProps.text &&
    prevProps.completed === nextProps.completed
  );
}); 