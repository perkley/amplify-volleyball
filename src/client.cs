import type { Schema } from "../amplify/data/resource"
import { generateClient } from "aws-amplify/data"

const client = generateClient<Schema>()

await client.mutations.addUserToGroup({
  groupName: "ADMINS",
  userId: "5468d468-4061-70ed-8870-45c766d26225",
})