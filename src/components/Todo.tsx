import { useState, useEffect, useCallback, useMemo } from 'react';
import TaskCard from './TaskCard';
import { cn } from '../utils/cn';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../context/AuthContext';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function TodoList() {
  const { user } = useAuth();
  const { 
    todos, 
    isLoading, 
    error, 
    realtimeStatus, 
    addTodo, 
    editTodo, 
    toggleTodo, 
    deleteTodo, 
    reorderTodos, 
    retryLoading,
    completedCount,
    totalCount
  } = useTodos();
  const [inputValue, setInputValue] = useState('');
  
  // Set up DnD sensors (mouse/touch/keyboard) - memoized to avoid recreation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to activate dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Log on mount and theme changes without affecting subscriptions
  useEffect(() => {
    console.log('[Todo] Component rendered or theme changed, maintaining real-time connection');
  }, []);

  // Handle drag end for reordering - memoized to avoid recreation
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    console.log(`[Todo] Reordering: Moving ${active.id} to ${over.id}`);
    
    const oldIndex = todos.findIndex(todo => todo.id === active.id);
    const newIndex = todos.findIndex(todo => todo.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(todos, oldIndex, newIndex);
      reorderTodos(newOrder);
    }
  }, [todos, reorderTodos]);

  const handleAddTodo = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    try {
      await addTodo(inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }, [inputValue, addTodo]);

  const handleToggleComplete = useCallback(async (id: number) => {
    try {
      const todo = todos.find(todo => todo.id === id);
      if (todo) {
        await toggleTodo(id, !todo.completed);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }, [todos, toggleTodo]);

  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      await deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }, [deleteTodo]);

  const handleEditTodo = useCallback(async (id: number, newText: string) => {
    try {
      await editTodo(id, newText);
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  }, [editTodo]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClearCompleted = useCallback(() => {
    const completedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);
    
    completedTodoIds.forEach(id => handleDeleteTodo(id));
  }, [todos, handleDeleteTodo]);

  // Excel export function
  const exportToExcel = useCallback(() => {
    if (todos.length === 0) return;
    
    // Format the data for Excel
    const headers = ['ID', 'Task', 'Status', 'Created At'];
    
    // Convert todos to rows
    const data = todos.map(todo => [
      todo.id,
      todo.text,
      todo.completed ? 'Completed' : 'Pending',
      new Date(todo.created_at || Date.now()).toLocaleString()
    ]);
    
    // Combine headers and data
    const excelData = [headers, ...data];
    
    // Convert to CSV format
    const csvContent = excelData
      .map(row => row.map(cell => 
        // Escape quotes and wrap in quotes if contains comma or newline
        typeof cell === 'string' && (cell.includes(',') || cell.includes('\n') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
      .join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download
    link.setAttribute('href', url);
    link.setAttribute('download', `todos-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [todos]);

  // Memoize the sortable items array to prevent unnecessary recreation
  const sortableItems = useMemo(() => 
    todos.map(todo => todo.id), 
    [todos]
  );

  // Memoize the empty state component
  const emptyState = useMemo(() => (
    <li className={cn(
      "text-center py-2 transition-colors",
      "text-gray-500 dark:text-gray-400"
    )}>
      No tasks yet. Add one above!
    </li>
  ), []);

  // Memoize the loading spinner
  const loadingSpinner = useMemo(() => (
    <div className="flex justify-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
    </div>
  ), []);

  // Memoize the error component
  const errorComponent = useMemo(() => (
    <div className={cn(
      "p-4 mb-4 rounded",
      "bg-red-100 dark:bg-red-900",
      "text-red-700 dark:text-red-200"
    )}>
      <p className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
      <button 
        onClick={retryLoading}
        className={cn(
          "mt-2 px-3 py-1 rounded text-sm font-medium",
          "bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700",
          "text-red-700 dark:text-red-200",
          "transition-colors"
        )}
      >
        Retry
      </button>
    </div>
  ), [error, retryLoading]);

  // Memoize the sign in notice
  const signInNotice = useMemo(() => (
    <div className={cn(
      "p-4 mb-4 rounded",
      "bg-yellow-100 dark:bg-yellow-900",
      "text-yellow-700 dark:text-yellow-200"
    )}>
      <p className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
        Please sign in to manage your todos.
      </p>
    </div>
  ), []);

  // Memoize the task list rendering
  const taskList = useMemo(() => (
    <ul className="space-y-2" aria-label="Todo list">
      {todos.length === 0 ? emptyState : (
        todos.map(todo => (
          <TaskCard
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={handleToggleComplete}
            onDelete={handleDeleteTodo}
            onEdit={handleEditTodo}
          />
        ))
      )}
    </ul>
  ), [todos, emptyState, handleToggleComplete, handleDeleteTodo, handleEditTodo]);

  // Memoize the footer component
  const footer = useMemo(() => (
    <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <p className={cn(
          "text-xs transition-colors",
          "text-gray-500 dark:text-gray-400"
        )}>
          {completedCount} of {totalCount} tasks completed
        </p>
        
        <div className="flex gap-2">
          {completedCount > 0 && (
            <button 
              onClick={handleClearCompleted}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800",
                "text-red-700 dark:text-red-300"
              )}
            >
              Clear completed
            </button>
          )}
          
          {todos.length > 0 && (
            <button 
              onClick={exportToExcel}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                "bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800",
                "text-green-700 dark:text-green-300",
                "flex items-center gap-1"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel
            </button>
          )}
        </div>
      </div>
      
      {user && (
        <p className={cn(
          "text-xs mt-1 transition-colors",
          realtimeStatus === 'SUBSCRIBED' 
            ? "text-green-500 dark:text-green-400" 
            : "text-orange-500 dark:text-orange-400"
        )}>
          {realtimeStatus === 'SUBSCRIBED' 
            ? "✓ Real-time updates active" 
            : "⚠ Real-time updates inactive"}
        </p>
      )}
    </footer>
  ), [completedCount, totalCount, handleClearCompleted, user, realtimeStatus, todos.length, exportToExcel]);

  return (
    <div className={cn(
      "rounded-lg shadow-md p-6 w-full max-w-md transition-colors",
      "bg-white dark:bg-gray-800"
    )}>
      <header>
        <h2 className={cn(
          "text-2xl font-bold mb-4 transition-colors",
          "text-primary-700 dark:text-primary-400"
        )}>
          Todo List
        </h2>
      </header>
      
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <label htmlFor="new-todo" className="sr-only">Add a new task</label>
        <input
          id="new-todo"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add a new task..."
          className={cn(
            "flex-1 px-4 py-2 rounded border transition-colors",
            "border-gray-300 dark:border-gray-600",
            "bg-white dark:bg-gray-700",
            "text-gray-800 dark:text-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500"
          )}
          disabled={isLoading || !user}
        />
        <button 
          type="submit"
          className={cn(
            "px-4 py-2 rounded transition-colors",
            "bg-primary-600 hover:bg-primary-700",
            "text-white font-medium",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={!inputValue.trim() || isLoading || !user}
          aria-label="Add task"
        >
          Add
        </button>
      </form>

      {!user && signInNotice}
      {error ? errorComponent : isLoading ? loadingSpinner : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            {taskList}
          </SortableContext>
        </DndContext>
      )}
      
      {!isLoading && todos.length > 0 && footer}
    </div>
  );
} 