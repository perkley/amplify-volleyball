import { type ClientSchema, a, defineData } from "@aws-amplify/backend";


/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/

const schema = a.schema({
  Pool: a.model ({
    team: a.string(),
    wins: a.integer(),
    losses: a.integer(),
    pointDifferentials: a.integer().array(),
    sum: a.integer(),
    rank: a.integer(),
  }).authorization(allow => [allow.authenticated().to(['read']), allow.groups(["Administrator"]).to(['read', 'create', 'delete'])])

  // Venue: a.model ({
  //   venueId: a.id(),
  //   name: a.string(),
  //   matches: a.hasMany("Match","matchId"),
  //   owner: a.string().authorization(allow => [allow.owner().to(['read']), allow.group("Administrator").to(['read', 'delete'])])
  // }).authorization(allow => [allow.guest().to(['read']), allow.owner().to(['read']), allow.group("Administrator").to(['read', 'delete'])]),

  // Team: a.model ({
  //   teamId: a.id(),
  //   name: a.string(),
  //   wins: a.integer(),
  //   losses: a.integer(),
  //   match: a.hasMany("Match","matchId"),
  //   owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group("Admin").to(['read', 'delete'])])
  // }).authorization(allow => [allow.guest().to(['read']), allow.owner()]),

  // Match: a.model ({
  //   matchId: a.id(),
  //   venue: a.belongsTo("Venue", "matchId"),
  //   team1: a.belongsTo("Team", "matchId"),
  //   team2: a.belongsTo("Team", "matchId"),
  //   team1Score: a.integer(),
  //   team2Score: a.integer(),
  //   owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group("Admin").to(['read', 'delete'])])
  // }).authorization(allow => [allow.guest().to(['read']), allow.owner()]),
});

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
