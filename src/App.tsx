import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
//import { fetchAuthSession } from 'aws-amplify/auth';

import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();
type Venue = Schema['Venue']['type']
//const session = await fetchAuthSession();

function App() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting'); // Initial state

  //console.log("id token", session.tokens?.idToken)
  //console.log("access token", session.tokens?.accessToken)

  useEffect(() => {
    const sub = client.models.Venue.observeQuery().subscribe({
      next: ({items}) => {
        setVenues([...items])
      },
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
      sub.unsubscribe();
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
