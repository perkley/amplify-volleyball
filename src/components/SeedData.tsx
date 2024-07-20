// import { ClientVpnEndpoint } from "aws-cdk-lib/aws-ec2";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

export const seedPoolGroupData = async () => {
    await CreateNewPoolGroup({
      tournamentName: "Summer Tournament 2024",
      poolNames: ["Pool A", "Pool B", "Pool C"]
    });

    await CreateNewPoolGroup({
      tournamentName: "Fall Tournament 2024",
      poolNames: ["Pool D", "Pool E", "Pool F"]
    });
}

const CreateNewPoolGroup = async ({tournamentName, poolNames}: {tournamentName: string;  poolNames: string[];}) => {
    const { data: poolGroup } = await client.models.PoolGroup.create({
      name: tournamentName,
    });

    console.log("Created Pool Group:", poolGroup);

    const createdPools = await Promise.all(
      poolNames.map(async (poolName) => {
        const { data: pool } = await client.models.Pool.create({
          name: poolName,
          poolGroupId: poolGroup?.id,
        });
        return pool;
      })
    );

      console.log('Created Pools', createdPools);
}

export const seedBracketsData = async () => {
    // Create the tournament
    const { data: tournament } = await client.models.Tournament.create({
        name: "BRONZE BRACKET CHAMPIONSHIP",
    });

    // Now we need some teams
    const { data: team1 } = await client.models.Team.create({
        name: "Henry's Hitters",
        rank: 1
    });
    const { data: team2 } = await client.models.Team.create({
        name: "Josh's Jumpers",
        rank: 8
    });
    const { data: team3 } = await client.models.Team.create({
        name: "Raphael's Rallyers",
        rank: 4
    });
    const { data: team4 } = await client.models.Team.create({
        name: "Dillan's Diggers",
        rank: 5
    });
    const { data: team5 } = await client.models.Team.create({
        name: "Caleb's Crushers",
        rank: 2
    });
    const { data: team6 } = await client.models.Team.create({
        name: "Kadeen's Krusaders",
        rank: 7,
    });
    const { data: team7 } = await client.models.Team.create({
        name: "Martin's Mavericks",
        rank: 3,
    });
    const { data: team8 } = await client.models.Team.create({
        name: "Vance's Volleyers",
        rank: 6
    });
    const { data: team9 } = await client.models.Team.create({
      name: "Douglas's Dynamos",
      rank: 0
  });
    console.log('Add Teams', team1, team2, team3, team4, team5, team6, team7, team8, team9);

    // Create some matches
    const { data: match_r1m1 } = await client.models.Match.create({
        matchNumber: 1,
        round: 1,
        team1Id: team1?.id,
        team2Id: team2?.id,
        team1Score: 14,
        team2Score: 10,
        winningTeamId: team1?.id,
        tournamentId: tournament?.id,
    });
    const { data: match_r1m2 } = await client.models.Match.create({
        matchNumber: 2,
        round: 1,
        team1Id: team3?.id,
        team2Id: team4?.id,
        team1Score: 11,
        team2Score: 12,
        winningTeamId: team4?.id,
        tournamentId: tournament?.id,
    });
    const { data: match_r2m1 } = await client.models.Match.create({
        matchNumber: 1,
        round: 2,
        team1Id: team1?.id,
        team2Id: team4?.id,
        team1Score: 8,
        team2Score: 11,
        winningTeamId: team4?.id,
        tournamentId: tournament?.id,
    });
    await client.models.Match.create({
      matchNumber: 1,
      round: 3,
      team1Id: team4?.id,
      //team2Id: team4?.id,
      team1Score: 0,
      team2Score: 0,
      //winningTeamId: team4?.id,
      tournamentId: tournament?.id,
  });

    // Connect the Round 2 Match 1 as the Next Match for the first Matches
    if (match_r1m1 && match_r2m1) {
        await client.models.Match.update({
            id: match_r1m1.id,
            nextMatchId: match_r2m1.id,
        })
    }
    if (match_r1m2 && match_r2m1) {
        await client.models.Match.update({
            id: match_r1m2.id,
            nextMatchId: match_r2m1.id,
        })
    }

    console.log('Data Finished being Added');
    
}


export const deleteAllData = async () => {
    // Delete the children first, then move up to each parent
    // Delete Matches
    const matches = await client.models.Match.list();
    for (const match of matches.data) {
      await client.models.Match.delete(match);
    }

    // Delete Pools
    const pools = await client.models.Pool.list();
    for (const pool of pools.data) {
      await client.models.Pool.delete(pool);
    }

    // Delete Pool Groups
    const poolGroups = await client.models.PoolGroup.list();
    for (const pg of poolGroups.data) {
      await client.models.PoolGroup.delete(pg);
    }

    // Delete Teams
    const teams = await client.models.Team.list();
    for (const team of teams.data) {
      await client.models.Team.delete(team);
    }

    // Delete Tournaments
    const tournaments = await client.models.Tournament.list();
    for (const tournament of tournaments.data) {
      await client.models.Tournament.delete(tournament);
    }
    console.log('All Data Deleted');
}