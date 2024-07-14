import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  PoolGroup: a.model ({
    name: a.string().required(),
    poolId: a.id(),
    pools: a.hasMany("Pool", "poolGroupId")
  }),
  // .identifier(["poolGroupId"]),

  Pool: a.model ({
    // poolId: a.id().required(),
    name: a.string().required(),
    teams: a.hasMany("Team", "poolId"), 
    poolGroupId: a.id(),
    poolGroup: a.belongsTo("PoolGroup", "poolGroupId"),
  }),
  // .identifier(["poolId"]),

  Team: a.model ({
    // teamId: a.id().required(),
    name: a.string().required(),
    wins: a.integer(),
    losses: a.integer(),
    pointDifferentials: a.integer().array(),
    sum: a.integer(),
    place: a.integer(),
    rank: a.integer(),
    // matchId: a.id(),
    // matches: a.hasMany("Match","teamId"),
    poolId: a.string(),
    pool: a.belongsTo("Pool", "poolId"),
  }),
  // .identifier(["teamId"]),

  // Match: a.model ({
  //   // matchId: a.id().required(),
  //   teamId: a.id(),
  //   venueId: a.string(), // foreign key
  //   venue: a.belongsTo("Venue", "venueId"),
  //   team1id: a.id(),
  //   team1: a.belongsTo("Team", "team1Id"),
  //   team2id: a.id(),
  //   team2: a.belongsTo("Team", "team2Id"),
  //   team1Score: a.integer(),
  //   team2Score: a.integer(),
  // }),
  // .identifier(["matchId"]),

  // Venue: a.model ({
  //   // venueId: a.id().required(),
  //   name: a.string(),
  //   address: a.string(),
  //   matches: a.hasMany("Match","venueId"),
  // })
  // .identifier(["venueId"]),
}).authorization(allow => [allow.authenticated().to(['read']), allow.groups(["Administrator"]).to(['read', 'create', 'update', 'delete'])]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    //defaultAuthorizationMode: "apiKey",
    //API Key is used for a.allow.public() rules
    //apiKeyAuthorizationMode: {
     //expiresInDays: 30,
    //},
    defaultAuthorizationMode: 'userPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

