import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();
type Pool = Schema['Pool']['type'];

function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting'); // Initial state
  const [userGroups, setUserGroups] = useState<string[]>([]);

  //console.log("id token", session.tokens?.idToken)
  //console.log("access token", session.tokens?.accessToken)

  useEffect(() => {
    const sub = client.models.Pool.observeQuery().subscribe({
      next: ({items}) => {
        console.log("observe", items),
        setPools([...items])
      },
    });

    async function fetchUserGroup() {
      try {
        console.log('UserGroups',userGroups);
        const currentUser = await getCurrentUser();
        console.log('Current User:', currentUser);
        const userAttributes = await fetchUserAttributes();
        console.log('userAttributes', userAttributes);
        // Properly handle the 'cognito:groups' attribute
        const groupsAttribute = userAttributes['cognito:groups'];
        console.log('Groups Attributes', groupsAttribute);
        let groups: string[] = [];
        
        if (typeof groupsAttribute === 'string') {
          // If it's a string, split it into an array
          groups = groupsAttribute.split(',');
        } else if (Array.isArray(groupsAttribute)) {
          // If it's already an array, use it as is
          groups = groupsAttribute;
        }
        
        console.log('groups', groups);

        setUserGroups(groups);
      } catch (error) {
        console.error('Error fetching user group:', error);
      }
    }
    fetchUserGroup();

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



  function createPool() {
    client.models.Pool.create(
      { team: window.prompt("Team Name") }
  );
  }

    
  // function deletePool(id: string) {
  //   client.models.Pool.delete(
  //     { id },
  //     { authMode: 'userPool'})
  // }

  return (

    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s View</h1>

          <button onClick={createPool}>+ new</button>
          <ul>
            {pools.map((pool) => (
              <li key={pool.id}>
                {pool.team} | {pool.wins} | {pool.losses} | 
                {pool.pointDifferentials?.join(', ')}
                { /* Replace with your actual group check logic */
                  // (user?.attributes?.['custom:groups']?.includes("Administrator")) && (
                  //   <button onClick={() => deletePool(pool.id)}>Delete</button>
                  // )
                }
              </li>
            ))}
          </ul>
          <div>
            <p>Connection Status: {connectionState}</p>  {/* Display connection state */}
          </div>
          <button onClick={signOut}>Sign out</button>
          <h2>User Groups:</h2>
      
      {userGroups.length > 0 ? (
        <ul>
          {userGroups.map((group, index) => (
            <li key={index}>{group}</li>
          ))}
        </ul>
      ) : (
        <p>User is not in any groups.</p>
      )}

        </main>
      )}
    </Authenticator>
  );
}

export default App;
