import * as dgraph from "dgraph-js"

// Drop All - discard all data, schema and start from a clean slate.
async function dropAll(dgraphClient) {
  const op = new dgraph.Operation()
  op.setDropAll(true)
  await dgraphClient.alter(op)
}

// Drop All Data, but keep the schema.
async function dropData(dgraphClient) {
  const op = new dgraph.Operation()
  op.setDropOp(dgraph.Operation.DropOp.DATA)
  await dgraphClient.alter(op)
}

// Set schema.
async function setSchema(dgraphClient) {
  const schema = `
        name: string @index(exact) .
        age: int .
        married: bool .
        loc: geo .
        dob: datetime .
        friend: [uid] @reverse .
    `
  const op = new dgraph.Operation()
  op.setSchema(schema)
  await dgraphClient.alter(op)
}

// Create data using JSON.
async function createData(dgraphClient) {
  // Create a new transaction.
  const txn = dgraphClient.newTxn()
  try {
    // Create data.
    const p = {
      uid: "_:alice",
      name: "Alice",
      age: 26,
      married: true,
      loc: {
        type: "Point",
        coordinates: [1.1, 2],
      },
      dob: new Date(1980, 1, 1, 23, 0, 0, 0),
      friend: [
        {
          name: "Bob",
          age: 24,
        },
        {
          name: "Charlie",
          age: 29,
        },
      ],
      school: [
        {
          name: "Crown Public School",
        },
      ],
    }

    // Run mutation.
    const mu = new dgraph.Mutation()
    mu.setSetJson(p)
    const response = await txn.mutate(mu)

    // Commit transaction.
    await txn.commit()

    // Get uid of the outermost object (person named "Alice").
    // Response#getUidsMap() returns a map from blank node names to uids.
    // For a json mutation, blank node label is used for the name of the created nodes.
    console.log(`Created person named "Alice" with uid = ${response.getUidsMap().get("alice")}\n`)

    console.log("All created nodes (map from blank node names to uids):")
    response.getUidsMap().forEach((uid, key) => console.log(`${key} => ${uid}`))
    console.log()
  } finally {
    // Clean up. Calling this after txn.commit() is a no-op
    // and hence safe.
    await txn.discard()
  }
}

// Query for data.
async function queryData(dgraphClient) {
  // Run query.
  const query = `query all($a: string) {
        all(func: eq(name, $a)) {
            uid
            name
            age
            married
            loc
            dob
            friend {
                name
                age
            }
            school {
                name
            }
        }
    }`
  const vars = { $a: "Alice" }
  const res = await dgraphClient.newTxn({ readOnly: true }).queryWithVars(query, vars)
  const ppl = res.getJson()

  // Print results.
  console.log(`Number of people named "Alice": ${ppl.all.length}`)
  ppl.all.forEach((person) => console.log(person))
}

async function main() {
  const dgraphClient = await dgraph.open("dgraph://groot:password@localhost:9080")
  await dropAll(dgraphClient)
  await setSchema(dgraphClient)
  await createData(dgraphClient)
  await queryData(dgraphClient)
  await dropData(dgraphClient)
  await queryData(dgraphClient)
  await createData(dgraphClient)
  await queryData(dgraphClient)

  // Close the client stub.
  dgraphClient.close()
}

main()
  .then(() => {
    console.log("\nDONE!")
  })
  .catch((e) => {
    console.log("ERROR: ", e)
  })
