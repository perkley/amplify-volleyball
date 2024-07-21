import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from "../../amplify/data/resource";
import '../editpool.css';

const client = generateClient<Schema>();
type Pool = Schema['Pool']['type'];

const EditPool: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pool, setPool] = useState<Pool | null>(null);
  const [pointDiffInput, setPointDiffInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchPool(id);
    }
  }, [id]);

  useEffect(() => {
    if (pool && pool.pointDifferentials) {
      setPointDiffInput(pool.pointDifferentials.join(','));
    }
  }, [pool]);

  const fetchPool = async (poolId: string) => {
    try {
      const fetchedPool = await client.models.Pool.get({ id: poolId });
      if (fetchedPool) {
        setPool(fetchedPool.data);
      }
    } catch (error) {
      console.error('Error fetching pool:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pointDifferentials') {
      setPointDiffInput(value);
    } else {
      setPool(prev => {
        if (!prev) return null;
        return { ...prev, [name]: name === 'wins' || name === 'losses' ? parseInt(value, 10) || 0 : value };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pool) return;
  
    const parsedPointDiffs = pointDiffInput.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
  
    try {
      await client.models.Pool.update({
        id: pool.id,
        team: pool.team,
        wins: pool.wins,
        losses: pool.losses,
        pointDifferentials: parsedPointDiffs,
      });
      navigate('/');
    } catch (error) {
      console.error('Error updating pool:', error);
    }
  };

  if (!pool) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Pool</h2>
      <div>
        <label htmlFor="team">Team:</label>
        <input
          type="text"
          id="team"
          name="team"
          value={pool.team ?? ''}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="wins">Wins:</label>
        <input
          type="number"
          id="wins"
          name="wins"
          value={pool.wins ?? 0}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="losses">Losses:</label>
        <input
          type="number"
          id="losses"
          name="losses"
          value={pool.losses ?? 0}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="pointDifferentials">Point Differentials (comma-separated):</label>
        <input
          type="text"
          id="pointDifferentials"
          name="pointDifferentials"
          value={pointDiffInput}
          onChange={handleInputChange}
        />
      </div><br/>
      <button type="submit">Save Changes</button>&nbsp;&nbsp;
      <button type="button" onClick={() => navigate('/')}>Cancel</button>
    </form>
  );
};

export default EditPool;