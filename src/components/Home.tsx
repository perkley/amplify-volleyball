import React, { useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/data';


const client = generateClient<Schema>();
type Pool = Schema['Pool']['type'];

interface HomeProps {
  user: any;
  signOut: (() => void) | undefined;
}



const Home: React.FC<HomeProps> = ({ signOut }) => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [connectionState, setConnectionState] = useState<string>('Connecting');

  useEffect(() => {
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

  const createPool = () => {
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

  const deletePool = (id: string) => {
    client.models.Pool.delete({ id }, { authMode: 'userPool' });
  }

  return (
    <div>
      <button onClick={createPool}>Create Default List</button>

      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Point Differentials</th>
            <th>Total</th>
            <th>Place</th>
            <th>Actions</th>
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
              <td><Link to={`/edit/${pool.id}`}>Edit</Link></td>
              <td><button onClick={() => deletePool(pool.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <p>Connection Status: {connectionState}</p>
      </div>
      {signOut && <button onClick={signOut}>Sign out</button>}
    </div>
  );
}

export default Home;
