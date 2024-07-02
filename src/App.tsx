import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
//import { fetchAuthSession } from 'aws-amplify/auth';

import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();
//const session = await fetchAuthSession();

function App() {
  const [venues, setVenues] = useState<Array<Schema["Venue"]["type"]>>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting'); // Initial state

  //console.log("id token", session.tokens?.idToken)
  //console.log("access token", session.tokens?.accessToken)

  useEffect(() => {
    client.models.Venue.observeQuery().subscribe({
      next: (data) => {console.log("observe", data); setVenues([...data.items]);},
    });

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

  unsubscribeFromHub();
};

  }, []);



  function createVenue() {
    client.models.Venue.create(
      { name: window.prompt("Venue Name") }
  );
  }

    
  function deleteVenue(id: string) {
    client.models.Venue.delete(
      { id },
      { authMode: 'userPool'})
  }

  return (
        
    <Authenticator>
      {({ signOut, user }) => (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Venues</h1>
      
      <button onClick={createVenue}>+ new</button>
      <ul>
        {venues.map((venue) => (
          <li onClick={() => deleteVenue(venue.id)} key={venue.id}>{venue.name}</li>
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
