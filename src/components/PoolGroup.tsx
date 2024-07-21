import React, { useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
//import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { Loader } from '@aws-amplify/ui-react';
//import { Hub } from 'aws-amplify/utils';
//import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';

const client = generateClient<Schema>();
type PoolGroup = Schema['PoolGroup']['type'];
type Pool = Schema['Pool']['type'];

interface PoolGroupProps {
  user: any;
  isAdmin: boolean;
}

const PoolGroup: React.FC<PoolGroupProps> = ({isAdmin}) => {
  const [poolGroups, setPoolGroups] = useState<PoolGroup[]>([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const [poolsByGroup, setPoolsByGroup] = useState<{ [key: string]: Pool[] }>({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    console.log("Entered Here");
    const fetchData = async () => {
      const poolGroups = await client.models.PoolGroup.list();
      console.log('poolGroups', poolGroups, isAdmin);
      if (poolGroups.data) {
        setPoolGroups(poolGroups.data);
      }
    };

    
    fetchData();
    setLoading(false);
  }, []);

  const togglePoolGroup = (id: string) => {
    setExpandedGroupIds(prevIds => {
      if (prevIds.includes(id)) {
        // If the id is already in the array, remove it (collapse)
        return prevIds.filter(groupId => groupId !== id);
      } else {
        // If the id is not in the array, add it (expand)
        if (!poolsByGroup[id]) {
          fetchPoolsForGroup(id);
        }
        return [...prevIds, id];
      }
    });
  };

    const fetchPoolsForGroup = async (groupId: string) => {
      try {
        const result = await client.models.Pool.list({
          filter: { poolGroupId: { eq: groupId } }
        });
        console.log(`Pools for group ${groupId}:`, result);
        if (result.data) {
          setPoolsByGroup(prev => ({
            ...prev,
            [groupId]: result.data
          }));
        }
      } catch (error) {
        console.error(`Error fetching pools for group ${groupId}:`, error);
      }
    };
  
  // const fetchPoolGroupWithPools = (id: string) => { 
  //   return client.models.PoolGroup.get(
  //     { id: id },
  //     { selectionSet: ["id", "name", "pools.*"] },
  //   );
  // }


  if (loading) {
    
    return (<div>
        Loading ...
      <Loader variation="linear" />
         </div>
         
    );
  }


  if (!poolGroups) {
    return <p>Loading PoolGroups...</p>;
  }

  return (
    <div>
      {
        poolGroups.map((poolGroup) => (
          <div key={poolGroup.id}>
            <h2 
              onClick={() => togglePoolGroup(poolGroup.id)}
              style={{ 
                cursor: 'pointer', 
                backgroundColor: '#000', 
                padding: '5px', 
                margin: '0'
              }}
            >
              Pool Group: {poolGroup.name} {expandedGroupIds.includes(poolGroup.id) ? '▼' : '▶'}
            </h2>
            {expandedGroupIds.includes(poolGroup.id) && (
              <div style={{ padding: '10px' }}>
                {poolsByGroup[poolGroup.id] ? (
                  poolsByGroup[poolGroup.id].length > 0 ? (
                    <ul>
                      {poolsByGroup[poolGroup.id].map((pool) => (
                        <li key={pool.id}>{pool.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No pools in this group yet.</p>
                  )
                ) : (
                  <p>Loading pools...</p>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );

}
export default PoolGroup;
