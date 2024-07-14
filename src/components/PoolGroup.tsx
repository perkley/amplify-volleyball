import React, { useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
//import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
//import { Hub } from 'aws-amplify/utils';
//import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Loader } from '@aws-amplify/ui-react';
// import { v4 as uuidv4 } from 'uuid';

const client = generateClient<Schema>();
//type PoolGroup = Schema['PoolGroup']['type'];
type PoolGroup = {
  name: string;
  id: string;
  pools: { name: string; poolGroupId: Nullable<string>; id: string; createdAt: string; updatedAt: string }[];
};
//type Pool = Schema['Pool']['type'];

interface PoolGroupProps {
  user: any;
  isAdmin: boolean;
}


// function generateUniqueId(): string {
//   return uuidv4();
// }

// Generate a unique ID for the PoolGroup
//const poolGroupId = generateUniqueId(); // You'll need to implement this function



export const createTournamentStructure = async () => {
  try {
   
  // Create a new PoolGroup
        const { data: poolGroup } = await client.models.PoolGroup.create({
          name: 'Summer Tournament 2024',
        });    
  // const newPoolGroup = await client.models.PoolGroup.create({
  //         //poolGroupId: generateUniqueId(),
  //         name: "Summer Tournament 2024"
  //       });
      console.log("Created Pool Group:", poolGroup);

      // Create two Pools

      const { data: poolA } = await client.models.Pool.create({
          //poolId: generateUniqueId(),
          name: "Pool A",
          poolGroupId: poolGroup?.id,
          //poolGroupId: newPoolGroup.data?.poolGroupId || poolGroupId
        });

        const { data: poolB } = await client.models.Pool.create({
          //poolId: generateUniqueId(),
          name: "Pool B",
          poolGroupId: poolGroup?.id,
          //poolGroupId: newPoolGroup.data?.poolGroupId || poolGroupId
        });
      console.log("Created Pools:", poolA, poolB);
      
      // Update PoolGroup with pool connections
      // client.models.Pool.update({
      //   poolGroupId.
      // })
      // await PoolGroup.updateData({
      //   pools: [poolA, poolB], // Array of created pool objects
      // });
          
          // Rest of your function...
        } catch (error) {
          console.error("Error creating tournament structure:", error);
        }

}

// client.models.Pool.create({
    //   team: "ZTV 18 Meyer",
    //   wins: 4,
    //   losses: 2,
    //   pointDifferentials: [7, 12, 11, 16, -16, -5],
    // });
    // client.models.Pool.create({
    //   team: "Bonneville",
    //   wins: 6,
    //   losses: 0,
    //   pointDifferentials: [12, 10, 8, 18, 16, 5],
    // });
    // client.models.Pool.create({
    //   team: "Show Muzzy",
    //   wins: 2,
    //   losses: 4,
    //   pointDifferentials: [-7, -12, -8, -18, 10, 12],
    // });
    // client.models.Pool.create({
    //   team: "Elite Lynns",
    //   wins: 0,
    //   losses: 6,
    //   pointDifferentials: [-12, -10, -11, -16, -10, -12],
    // });
    type Nullable<T> = T | null;

const PoolGroup: React.FC<PoolGroupProps> = ({isAdmin}) => {
  const [poolGroup, setPoolGroup] = useState<PoolGroup | null>(null);
  //const [poolGroups, setPoolGroups] = useState<PoolGroup[]>([]);
  // const [pools, setPools] = useState<Pool[]>([]);
  // const [connectionState, setConnectionState] = useState<string>('Connecting');
  // const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      //const { data: poolGroup } = client.models.PoolGroup.get({ id: "07487328-d7e7-4c8c-a6d0-77c9e77b7127" });
      //const { data: pools } = await poolGroup?.pools();
      //console.log('poolGroup', poolGroup);
      const fetchedData = fetchPoolGroupWithPools('07487328-d7e7-4c8c-a6d0-77c9e77b7127');
      console.log('fetchedData', fetchedData);
      //setPoolGroup(fetchedData);
    };

    fetchData();
  }, []);

  if (!poolGroup) {
    return <p>Loading PoolGroup...</p>;
  }

  // useEffect(() => {
  //   console.log('IsAdmin', isAdmin);
  //   const sub = client.models.PoolGroup.observeQuery().subscribe({
  //     next: async ({ items }) => {
  //       // Fetch full PoolGroup data with nested pools
  //       const fullPoolGroups = await Promise.all(
  //         items.map(async (poolGroup) => {
  //           const fullPoolGroupData = await client.models.PoolGroup.get(
  //             { id: poolGroup.id },
  //             { selectionSet: ["id", "name", "pools.*"] } // Include "pools.*" for nested data
  //           );
  //           return fullPoolGroupData;
  //         })
  //       );
  //       console.log('fullPoolGroups', fullPoolGroups);
  //       setPoolGroups(fullPoolGroups);
  //     },
  //   });

    // const unsubscribeFromHub = Hub.listen('api', (data: any) => {
    //     const { payload } = data;
    //     if (payload.event === CONNECTION_STATE_CHANGE) {
    //       const newConnectionState = payload.data.connectionState as string;
    //       setConnectionState(newConnectionState);
    //     }
    // });

  //   return () => {
  //     sub.unsubscribe();
  //     //unsubscribeFromHub();
  //   };
  // }, []);

  
  // async function getPoolGroupWithPools(poolGroupId: string): Promise<PoolGroup | null> {
  //   try {
  //     const { data } = await client.models.PoolGroup.get(
  //       { id: poolGroupId },
  //       { selectionSet: ["id", "name", "pools.*"] } // Include "pools.*" for nested data
  //     );
  //     return data; // Return the full PoolGroup data
  //   } catch (error) {
  //     console.error("Error fetching PoolGroup with pools:", error);
  //     return null; // Return null on error
  //   }
  // }

  // const { data: teamWithMembers } = await client.models.Team.get(
  //   { id: "MY_TEAM_ID" },
  //   { selectionSet: ["id", "members.*"] },
  // );
  
  // teamWithMembers.members.forEach(member => console.log(member.id));

  // const fetchPools = async (poolGroupId: string) => {
  //   try {
  //     const fetchedPools = await client.models.Pool.get({  poolGroupId: poolGroupId });
  //     if (fetchedPools) {
  //       setPools(fetchedPools.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching pools:', error);
  //   }
  // };
  const fetchPoolGroupWithPools = (id: string) => { 
    return client.models.PoolGroup.get(
      { id: id },
      { selectionSet: ["id", "name", "pools.*"] },
    );
  }


  // const fetchPoolGroupsWithPools = async () => { 
  //   return await client.models.PoolGroup.get(
  //     { selectionSet: ["id", "pools.*"] },
  //   );
  // }
  //const { data: team } = await client.models.Team.get({ id: "MY_TEAM_ID"});

  // const deletePool = (id: string) => {
  //   client.models.Pool.delete({ id }, { authMode: 'userPool' });
  // }

  // if (loading) {
    
  //   return (<div>
  //       Loading ...
  //     <Loader variation="linear" />
  //        </div>
         
  //   );
  // }
  // console.log('fetchPoolGroupsWithPools', fetchPoolGroupsWithPools)
//  fetchPoolGroupWithPools('07487328-d7e7-4c8c-a6d0-77c9e77b7127')
//   .then((data) => data && console.log(data.data));
  if (!poolGroup) {
    return <p>Loading PoolGroup...</p>;
  }

  //const { name, pools } = poolGroup;

  return (
    <div>
      


    {
      <div></div>
    
    }
      
      
      {/* {poolGroups.length > 0 ? (
        poolGroups.map((poolGroup) => (
          <div key={poolGroup.id}>
            <h2>Pool Group: {poolGroup.name}</h2>
            {poolGroup.pools.length > 0 ? (
              <ul>
                {poolGroup.pools.map((pool) => (
                  <li key={pool.id}>{pool.name}</li>
                ))}
              </ul>
            ) : (
              <p>No pools in this group yet.</p>
            )}
          </div>
        ))
      ) : (
        <Loader /> // Indicate loading state while fetching data
      )}  */}
      
      
      
    </div>
  );
}

export default PoolGroup;
