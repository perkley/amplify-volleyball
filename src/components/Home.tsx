import React, { useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';
import { Loader } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();
type Pool = Schema['Pool']['type'];

interface HomeProps {
  user: any;
  isAdmin: boolean;
}

export const createPool = () => {
    client.models.Pool.create({
      team: "ZTV 18 Meyer",
      wins: 4,
      losses: 2,
      pointDifferentials: [7, 12, 11, 16, -16, -5],
    });
    client.models.Pool.create({
      team: "Bonneville",
      wins: 6,
      losses: 0,
      pointDifferentials: [12, 10, 8, 18, 16, 5],
    });
    client.models.Pool.create({
      team: "Show Muzzy",
      wins: 2,
      losses: 4,
      pointDifferentials: [-7, -12, -8, -18, 10, 12],
    });
    client.models.Pool.create({
      team: "Elite Lynns",
      wins: 0,
      losses: 6,
      pointDifferentials: [-12, -10, -11, -16, -10, -12],
    });
  }



const Home: React.FC<HomeProps> = ({isAdmin}) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('IsAdmin', isAdmin);
    const sub = client.models.Pool.observeQuery().subscribe({
      next: ({ items }) => {
        const updatedPools = items.map((pool: Pool) => {
          if (!pool.pointDifferentials) return pool;

          pool.sum = pool.pointDifferentials.reduce((acc, curr) => (acc ?? 0) + (curr ?? 0), 0);
          return { ...pool };
        });

        const sortedPools = updatedPools.sort((a, b) => (b.sum ?? 0) - (a.sum ?? 0));
        sortedPools.forEach((pool, index) => {
          pool.rank = index + 1;
        });

        setPools(sortedPools);
        setLoading(false);
      },
    });

    const unsubscribeFromHub = Hub.listen('api', (data: any) => {
        const { payload } = data;
        if (payload.event === CONNECTION_STATE_CHANGE) {
          const newConnectionState = payload.data.connectionState as string;
          setConnectionState(newConnectionState);
        }
    });

    return () => {
      sub.unsubscribe();
      unsubscribeFromHub();
    };
  }, []);

  

  const deletePool = (id: string) => {
    client.models.Pool.delete({ id }, { authMode: 'userPool' });
  }

  if (loading) {
    
    return (<div>
        Loading ...
      <Loader variation="linear" />
         </div>
         
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Wins</th>
            <th>Losses</th>
            <th className="taLeft">Point Differentials</th>
            <th>Total</th>
            <th>Place</th>
            {isAdmin && (
                <>
            
            <th colSpan={2}>Admin</th>
            </>
              )}
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr key={pool.id}>
              <td>{pool.team}</td>
              <td className="taCenter">{pool.wins}</td>
              <td className="taCenter">{pool.losses}</td>
              <td>{pool.pointDifferentials?.join(' ')}</td>
              <td className="taCenter">{pool.sum}</td>
              <td className="taCenter">{pool.rank}</td>
              {isAdmin && (
                <>
              <td><Link to={`/edit/${pool.id}`}>Edit</Link></td>
              <td><td><a href="#" onClick={(e) => { e.preventDefault(); deletePool(pool.id); }}>Delete</a></td></td>
              </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <p>Connection Status: {connectionState}</p>
      </div>
      
    </div>
  );
}

export default Home;
