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

// Memoize checkbox component
const Checkbox = memo(({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (e: React.MouseEvent | React.ChangeEvent) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className={cn(
      "h-5 w-5 rounded border-gray-300",
      "text-primary-600 focus:ring-primary-500",
      "dark:border-gray-600 dark:bg-gray-700",
      "dark:focus:ring-primary-400"
    )}
  />
));

// Memoize edit input component
const EditInput = memo(({ 
  value, 
  onChange, 
  onKeyDown, 
  onBlur 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
    autoFocus
    className={cn(
      "w-full px-2 py-1 rounded",
      "border border-gray-300 dark:border-gray-600",
      "bg-white dark:bg-gray-700",
      "text-gray-900 dark:text-gray-100",
      "focus:outline-none focus:ring-2 focus:ring-primary-500",
      "dark:focus:ring-primary-400"
    )}
  />
));

// Memoize action buttons component
const ActionButtons = memo(({ 
  onEdit, 
  onDelete 
}: { 
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onEdit}
      className={cn(
        "p-1 rounded text-gray-500 hover:text-gray-700",
        "dark:text-gray-400 dark:hover:text-gray-200",
        "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
      aria-label="Edit task"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
    <button
      onClick={onDelete}
      className={cn(
        "p-1 rounded text-red-500 hover:text-red-700",
        "dark:text-red-400 dark:hover:text-red-300",
        "hover:bg-red-50 dark:hover:bg-red-900/20"
      )}
      aria-label="Delete task"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
));

const TaskCard = memo(({ 
  id, 
  text, 
  completed, 
  onToggle, 
  onDelete,
  onEdit
}: TaskCardProps) => {
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
  
  // Memoize event handlers
  const handleToggle = useCallback((e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    onToggle(id);
  }, [id, onToggle]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  }, [id, onDelete]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
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

  const handleEditTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg",
        "bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700",
        "hover:border-gray-300 dark:hover:border-gray-600",
        "transition-colors duration-200",
        isDragging && "shadow-lg"
      )}
    >
      <Checkbox checked={completed} onChange={handleToggle} />
      
      {isEditing ? (
        <EditInput
          value={editText}
          onChange={handleEditTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      ) : (
        <span
          className={cn(
            "flex-1 text-gray-900 dark:text-gray-100",
            completed && "line-through text-gray-500 dark:text-gray-400"
          )}
        >
          {text}
        </span>
      )}

      <ActionButtons onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
});

export default TaskCard; 