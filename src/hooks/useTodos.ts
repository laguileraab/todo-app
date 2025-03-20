import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase, Todo } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const userIdRef = useRef<string | null>(null);
  const todosRef = useRef<Todo[]>([]); // Use ref to avoid unnecessary re-renders

  // Keep the ref updated with the latest todos
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);
  
  // Memoize fetchTodos to prevent recreation on every render
  const fetchTodos = useCallback(async () => {
    if (!user) {
      console.log('[Todos] No user authenticated, skipping fetch');
      setIsLoading(false);
      setTodos([]);
      return;
    }

    try {
      console.log('[Todos] Fetching todos for user:', user.id);
      setIsLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        let errorMsg = 'Error fetching todos';
        
        // More specific error messages based on error code
        if (fetchError.code === 'PGRST116') {
          errorMsg = 'Error: The todos table does not exist. Please run setup script.';
        } else if (fetchError.code === '42501') {
          errorMsg = 'Error: Permission denied to access todos table. Check RLS policies.';
        } else if (fetchError.code === '42P01') {
          errorMsg = 'Error: The todos table does not exist. Please run setup script.';
        } else {
          errorMsg = `Error: ${fetchError.message}`;
        }
        
        console.error('[Todos] Error fetching todos:', fetchError);
        setError(errorMsg);
        setTodos([]);
      } else {
        console.log('[Todos] Fetched todos:', data);
        setTodos(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('[Todos] Error in fetchTodos:', err);
      setError('Unexpected error fetching todos');
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Setup real-time subscription in a separate effect
  useEffect(() => {
    // Skip if user hasn't changed or is not available
    if (!user || (userIdRef.current === user.id && channelRef.current)) {
      return;
    }
    
    // Update the reference to track the current user
    userIdRef.current = user.id;

    // Clean up any existing subscription
    if (channelRef.current) {
      console.log(`[Todos] Cleaning up previous real-time subscription`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('[Todos] Setting up real-time subscription for user:', user.id);

    // Create a unique channel name that includes the user ID to avoid conflicts
    const channelName = `todos-realtime-${user.id}`;
    console.log(`[Todos] Creating channel: ${channelName}`);

    // Set up real-time subscription with user-specific filter
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[Todos] Real-time event received:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('[Todos] Inserting new todo:', payload.new);
            setTodos((prev) => [payload.new as Todo, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('[Todos] Updating todo:', payload.new);
            setTodos((prev) =>
              prev.map((todo) =>
                todo.id === payload.new.id ? (payload.new as Todo) : todo
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('[Todos] Deleting todo:', payload.old.id);
            setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id));
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Todos] Real-time subscription status: ${status}`, err || '');
        setRealtimeStatus(status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[Todos] Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Todos] Real-time channel error:', err);
          setError('Error connecting to real-time updates. Todos may not update automatically.');
        }
      });
      
    // Store the channel in the ref for later cleanup
    channelRef.current = channel;

    // Clean up subscription on unmount or user change
    return () => {
      if (channelRef.current) {
        console.log(`[Todos] Cleaning up real-time subscription for channel`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]); // Only depend on user changes, not on component re-renders

  // Fetch todos when user changes or component mounts
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Memoize all the todoAction functions to prevent unnecessary recreations
  const addTodo = useCallback(async (text: string) => {
    if (!user) {
      console.log('[Todos] No user authenticated, cannot add todo');
      return;
    }

    if (!text.trim()) {
      console.log('[Todos] Empty todo text, skipping add');
      return;
    }

    try {
      console.log('[Todos] Adding new todo:', text);
      const maxPosition = todosRef.current.length > 0 
        ? Math.max(...todosRef.current.map(t => t.position || 0)) + 1 
        : 0;
      
      const newTodo = {
        text,
        completed: false,
        user_id: user.id,
        position: maxPosition
      };

      const { data, error: addError } = await supabase
        .from('todos')
        .insert([newTodo])
        .select();

      if (addError) {
        console.error('[Todos] Error adding todo:', addError);
        setError(`Error adding todo: ${addError.message}`);
        return;
      }

      console.log('[Todos] Todo added successfully:', data);
      
      // If real-time updates aren't working, manually update the state
      if (realtimeStatus !== 'SUBSCRIBED') {
        setTodos(prevTodos => [...(data || []), ...prevTodos]);
      }
    } catch (err) {
      console.error('[Todos] Error in addTodo:', err);
      setError('Unexpected error adding todo');
    }
  }, [user, realtimeStatus]);

  const toggleTodo = useCallback(async (id: number, completed: boolean) => {
    if (!user) {
      console.log('[Todos] No user authenticated, cannot toggle todo');
      return;
    }

    try {
      console.log('[Todos] Toggling todo completion:', id, completed);
      
      // Optimistically update UI
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      
      const { error: toggleError } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (toggleError) {
        console.error('[Todos] Error toggling todo:', toggleError);
        setError(`Error toggling todo: ${toggleError.message}`);
        // If toggle fails, refresh todos to revert optimistic update
        fetchTodos();
        return;
      }

      console.log('[Todos] Todo toggled successfully');
    } catch (err) {
      console.error('[Todos] Error in toggleTodo:', err);
      setError('Unexpected error toggling todo');
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const editTodo = useCallback(async (id: number, text: string) => {
    if (!user) {
      console.log('[Todos] No user authenticated, cannot edit todo');
      return;
    }

    try {
      console.log('[Todos] Editing todo:', id, text);
      
      // Optimistically update UI
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, text } : todo
        )
      );
      
      const { error: editError } = await supabase
        .from('todos')
        .update({ text })
        .eq('id', id)
        .eq('user_id', user.id);

      if (editError) {
        console.error('[Todos] Error editing todo:', editError);
        setError(`Error editing todo: ${editError.message}`);
        // If edit fails, refresh todos to revert optimistic update
        fetchTodos();
        return;
      }

      console.log('[Todos] Todo edited successfully');
    } catch (err) {
      console.error('[Todos] Error in editTodo:', err);
      setError('Unexpected error editing todo');
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const deleteTodo = useCallback(async (id: number) => {
    if (!user) {
      console.log('[Todos] No user authenticated, cannot delete todo');
      return;
    }

    try {
      console.log('[Todos] Deleting todo:', id);
      
      // Optimistically update UI
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('[Todos] Error deleting todo:', deleteError);
        setError(`Error deleting todo: ${deleteError.message}`);
        // If deletion fails, refresh the todos list
        fetchTodos();
        return;
      }

      console.log('[Todos] Todo deleted successfully');
      // No need to update state as we've already done it optimistically
    } catch (err) {
      console.error('[Todos] Error in deleteTodo:', err);
      setError('Unexpected error deleting todo');
      // If an exception occurs, refresh the todos list
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const reorderTodos = useCallback(async (newOrder: Todo[]) => {
    if (!user) {
      console.log('[Todos] No user authenticated, cannot reorder todos');
      return;
    }

    try {
      console.log('[Todos] Reordering todos');
      
      // Optimistically update UI
      setTodos(newOrder);
      
      // Prepare updates for each todo's position
      // We only need to update the minimum required fields
      const updates = newOrder.map((todo, index) => ({
        id: todo.id,
        user_id: user.id,
        text: todo.text,          // Include the required text field
        completed: todo.completed, // Include the completed status
        position: index,
      }));
      
      // Update all positions in a batch
      const { error: updateError } = await supabase.from('todos').upsert(updates);

      if (updateError) {
        console.error('[Todos] Error reordering todos:', updateError);
        setError(`Error reordering todos: ${updateError.message}`);
        // If reordering fails, refresh the todos list
        fetchTodos();
        return;
      }

      console.log('[Todos] Todos reordered successfully');
    } catch (err) {
      console.error('[Todos] Error in reorderTodos:', err);
      setError('Unexpected error reordering todos');
      // If an exception occurs, refresh the todos list
      fetchTodos();
    }
  }, [user, fetchTodos]);

  const retryLoading = useCallback(() => {
    setError(null);
    fetchTodos();
  }, [fetchTodos]);

  // Memoize the sorted and filtered todos to avoid unnecessary recalculations
  const completedCount = useMemo(() => todos.filter(todo => todo.completed).length, [todos]);
  const totalCount = useMemo(() => todos.length, [todos]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    todos,
    isLoading,
    error,
    realtimeStatus,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    reorderTodos,
    retryLoading,
    completedCount,
    totalCount
  }), [
    todos, 
    isLoading, 
    error, 
    realtimeStatus, 
    addTodo, 
    toggleTodo, 
    editTodo, 
    deleteTodo, 
    reorderTodos, 
    retryLoading,
    completedCount,
    totalCount
  ]);
} 