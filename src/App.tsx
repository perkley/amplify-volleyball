import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting'); // Initial state

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => {console.log("observe", data); setTodos([...data.items]);},
    });

    // Subscribe to creation of Todo
    const createSub = client.models.Todo.onCreate().subscribe({
      next: (data) => console.log("create", data),
      error: (error) => console.warn(error),
    });

    // Subscribe to update of Todo
    const updateSub = client.models.Todo.onUpdate().subscribe({
      next: (data) => console.log("update", data),
      error: (error) => console.warn(error),
    });

    // Subscribe to deletion of Todo
    // const deleteSub = client.models.Todo.onDelete().subscribe({
    //   next: (data) => console.log("delete", data),
    //   error: (error) => console.warn(error),
    // });

// Listen for connection state changes
const unsubscribeFromHub = Hub.listen('api', (data: any) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const newConnectionState = payload.data.connectionState as string;
    setConnectionState(newConnectionState);
  }
  
});

// Cleanup function to unsubscribe when the component unmounts
return () => {
  //unsubscribeFromSubscription.unsubscribe();
  createSub.unsubscribe;
  updateSub.unsubscribe;
  //deleteSub.unsubscribe;
  unsubscribeFromHub();
};

  }, []);



  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
        
    <Authenticator>
      {({ signOut, user }) => (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
      <p>Connection Status: {connectionState}</p>  {/* Display connection state */}
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
        
      )}
      </Authenticator>
  );
}

export default App;
