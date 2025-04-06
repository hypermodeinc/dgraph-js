/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../../src'

import { setSchema, setup, tryUpsert } from '../helper'

const concurrency = 3
const FIVE_MINUTES_IN_SECONDS = 5 * 60 * 1000 // 5 minutes in milliseconds

jest.setTimeout(FIVE_MINUTES_IN_SECONDS * 2)

let client: dgraph.DgraphClient

const firsts = ['Paul', 'Eric', 'Jack', 'John', 'Martin']
const lasts = ['Brown', 'Smith', 'Robinson', 'Waters', 'Taylor']
const ages = [20, 25, 30, 35]

type Account = {
  first: string
  last: string
  age: number
}
const accounts: Account[] = []

firsts.forEach((first: string): void =>
  lasts.forEach((last: string): void =>
    ages.forEach((age: number): void => {
      accounts.push({
        first,
        last,
        age,
      })
    }),
  ),
)

let startStatus = 0 // set at the start of doUpserts
let lastStatus = 0
let cancelled = false // cancelled due to timeout

let successCount = 0
let retryCount = 0

function conditionalLog(): void {
  const now = new Date().getTime()
  if (now - lastStatus > 1000 && !cancelled) {
    console.log(
      `Success: ${successCount}, Retries: ${retryCount}, Total Time: ${now - startStatus} ms`,
    )
    lastStatus = now
  }
}

async function upsert(account: Account): Promise<void> {
  let done = false
  const query = `query {
        account as var(func: eq(first, "${account.first}")) @filter(eq(last, "${account.last}") AND eq(age, "${account.age}"))
    }`
  const mu = new dgraph.Mutation()
  mu.setSetNquads(`
        uid(account) <first> "${account.first}" .
        uid(account) <last>  "${account.last}" .
        uid(account) <age>   "${account.age}"^^<xs:int> .
    `)
  const blankNodeLabel = `uid(account)`
  while (!done && !cancelled) {
    try {
      await tryUpsert(client, query, mu, blankNodeLabel)
      successCount += 1
      done = true
    } catch (e) {
      expect(e).toBe(dgraph.ERR_ABORTED)
      retryCount += 1
    }

    conditionalLog()
  }

  if (!done) {
    throw new Error(`Timeout elapsed: ${FIVE_MINUTES_IN_SECONDS / 1000}s`)
  }
}

async function doUpserts(): Promise<void> {
  const promises: Promise<void>[] = []
  for (const account of accounts) {
    for (let i = 0; i < concurrency; i += 1) {
      promises.push(upsert(account))
    }
  }

  startStatus = new Date().getTime()
  const id = setTimeout(() => {
    cancelled = true
  }, FIVE_MINUTES_IN_SECONDS)

  await Promise.all(promises).then(() => {
    clearTimeout(id)
  })
}

async function checkIntegrity(): Promise<void> {
  const res = await client.newTxn().query(`{
        all(func: anyofterms(first, "${firsts.join(' ')}")) {
            first
            last
            age
        }
    }`)

  const data: {
    all: Account[]
  } = res.getJson()

  const accountSet: { [key: string]: boolean } = {}
  for (const account of data.all) {
    expect(account.first).toBeTruthy()
    expect(account.last).toBeTruthy()
    expect(account.age).toBeTruthy()
    accountSet[`${account.first}_${account.last}_${account.age}`] = true
  }

  for (const account of accounts) {
    expect(accountSet[`${account.first}_${account.last}_${account.age}`]).toBe(
      true,
    )
  }
}

type Profile = {
  uid?: string
  name: string
  email: string
  age: number
}
const profiles: Profile[] = [
  { name: 'Alice', email: 'alice@dgraph.io', age: 25 },
  { name: 'Bob', email: 'bob@dgraph.io', age: 28 },
  { name: 'Prashant', email: 'prashant@dgraph.io', age: 23 },
]
const names: string[] = []
profiles.forEach((profile: Profile): void => {
  names.push(profile.name)
})

async function doUpsert(): Promise<void> {
  await performMutation(profiles[0])
  await performMutation(profiles[1])
  await performMutation(profiles[2])
  await checkMutationIntegrity(profiles)
  const updatedProfile: Profile = {
    name: 'Prashant Shahi',
    email: 'prashant@dgraph.io',
    age: 24,
  }
  await performUpsert(updatedProfile)
  await checkUpsertIntegrity()
}

async function doInsertUpsert(): Promise<void> {
  await performMutation(profiles[0])
  await performMutation(profiles[1])
  await performMutation(profiles[2])
  const tempProfiles: Profile[] = JSON.parse(JSON.stringify(profiles))
  await checkMutationIntegrity(tempProfiles)
  const updatedProfile: Profile = {
    uid: 'uid(profile)',
    name: 'Prashant Shahi',
    email: 'prashantshahi@dgraph.io',
    age: 24,
  }
  await performUpsert(updatedProfile)
  tempProfiles.push(updatedProfile)
  await checkMutationIntegrity(tempProfiles)
}

async function doJsonUpsert(): Promise<void> {
  await performJsonMutation(profiles[0])
  await performJsonMutation(profiles[1])
  await performJsonMutation(profiles[2])
  const tempProfiles: Profile[] = JSON.parse(JSON.stringify(profiles))
  await checkMutationIntegrity(tempProfiles)

  const updatedProfile: Profile = {
    name: 'Prashant Shahi',
    email: 'prashant@dgraph.io',
    age: 24,
  }
  await performJsonUpsert(updatedProfile)
  await checkUpsertIntegrity()
  tempProfiles.pop()
  tempProfiles.push(updatedProfile)
  await checkMutationIntegrity(tempProfiles)
}

async function performJsonMutation(profile: Profile): Promise<void> {
  const txn = client.newTxn()
  const mu = new dgraph.Mutation()
  const blankNodeLabel = profile.name.toLocaleLowerCase()
  profile.uid = `_:${blankNodeLabel}`
  mu.setSetJson(profile)

  const res = await txn.mutate(mu)
  await txn.commit()
  const uid = res.getUidsMap().get(blankNodeLabel)
  expect(uid).not.toEqual('')
}

async function performMutation(profile: Profile): Promise<void> {
  const txn = client.newTxn()
  const mu = new dgraph.Mutation()
  const blankNodeLabel = `${profile.name.toLocaleLowerCase()}`

  mu.setSetNquads(`
        _:${blankNodeLabel} <name> "${profile.name}" .
        _:${blankNodeLabel} <email>  "${profile.email}" .
        _:${blankNodeLabel} <age>   "${profile.age}"^^<xs:int> .
    `)

  const res = await txn.mutate(mu)
  await txn.commit()
  const uid = res.getUidsMap().get(blankNodeLabel)
  expect(uid).not.toEqual('')
}

async function performUpsert(profile: Profile): Promise<void> {
  const query = `query {
        profile as var(func: eq(email, "${profile.email}"))
    }`
  const mu = new dgraph.Mutation()
  const blankNodeLabel = `uid(profile)`
  mu.setSetNquads(`
        ${blankNodeLabel} <name> "${profile.name}" .
        ${blankNodeLabel} <email>  "${profile.email}" .
        ${blankNodeLabel} <age>   "${profile.age}"^^<xs:int> .
    `)

  await tryUpsert(client, query, mu, blankNodeLabel)
}

async function performJsonUpsert(profile: Profile): Promise<void> {
  const query = `query {
        profile as var(func: eq(email, "${profile.email}"))
    }`
  const mu = new dgraph.Mutation()
  const blankNodeLabel = `uid(profile)`
  profile.uid = blankNodeLabel
  mu.setSetJson(profile)
  const req = new dgraph.Request()
  req.setQuery(query)
  req.setMutationsList([mu])
  req.setCommitNow(true)

  const response = await client.newTxn().doRequest(req)
  const uid = response.getUidsMap().get(blankNodeLabel)
  expect(uid).not.toEqual('')
}

async function checkMutationIntegrity(ourProfiles: Profile[]): Promise<void> {
  const query = `{
        all(func: anyofterms(name, "${names.join(' ')}")) {
            uid
            name
            email
            age
        }
    }`
  const res = await client.newTxn().query(query)

  const data: {
    all: Profile[]
  } = res.getJson()

  const profileSet: { [key: string]: boolean } = {}
  for (const profile of data.all) {
    expect(profile.name).toBeTruthy()
    expect(profile.email).toBeTruthy()
    expect(profile.age).toBeTruthy()
    profileSet[`${profile.name}_${profile.email}_${profile.age}`] = true
  }

  expect(data.all.length).toEqual(ourProfiles.length)
  for (const profile of ourProfiles) {
    expect(profileSet[`${profile.name}_${profile.email}_${profile.age}`]).toBe(
      true,
    )
  }
}

async function checkUpsertIntegrity(): Promise<void> {
  const query = `{
        all(func: eq(email, "prashant@dgraph.io")) {
            name
            email
            age
        }
    }`
  const res = await client.newTxn().query(query)

  const data: {
    all: Profile[]
  } = res.getJson()

  const profileSet: { [key: string]: boolean } = {}
  for (const profile of data.all) {
    expect(profile.name).toBeTruthy()
    expect(profile.email).toBeTruthy()
    expect(profile.age).toBeTruthy()
    profileSet[`${profile.name}_${profile.email}_${profile.age}`] = true
  }

  const receivedObject: Profile = data.all[0]
  const expectedObject: Profile = {
    name: 'Prashant Shahi',
    email: 'prashant@dgraph.io',
    age: 24,
  }

  expect(Object.keys(profileSet).length).toEqual(1)
  expect(receivedObject).toEqual(expectedObject)
}

async function doInsertUpsertWithVars(): Promise<void> {
  await performMutation(profiles[0])
  const jsonObj = {
    uid: 'uid(person)',
    name: 'Prashant Shahi',
    email: 'prashantshahi@dgraph.io',
    age: '24',
  }
  const query = `query q($email: string) {
        person as q(func: eq(email, $email))
    }`
  const vars = {
    $email: 'prashant@dgraph.io',
  }

  const txn = client.newTxn()
  const mu = new dgraph.Mutation()
  mu.setSetJson(jsonObj)

  const req = new dgraph.Request()
  const varsMap = req.getVarsMap()
  req.setQuery(query)
  Object.keys(vars).forEach((key: string) => {
    varsMap.set(key, vars[key])
  })
  req.addMutations(mu)
  req.setCommitNow(true)

  try {
    // Update account only if matching uid found.
    const response = await txn.doRequest(req)
    const uid = response.getUidsMap().get('uid(person)')
    expect(uid).not.toEqual('')
  } finally {
    await txn.discard()
  }

  const updatedProfile: Profile = {
    name: 'Prashant Shahi',
    email: 'prashantshahi@dgraph.io',
    age: 24,
  }
  const query2 = `query q($email: string) {
        all(func: eq(email, $email)) {
            name
            email
            age
        }
    }`
  const vars2 = {
    $email: 'prashantshahi@dgraph.io',
  }
  const res = await client.newTxn().queryWithVars(query2, vars2)
  const data: {
    all: Profile[]
  } = res.getJson()
  const receivedObject: Profile = data.all[0]
  expect(receivedObject).toEqual(updatedProfile)
}

describe('upsert using doRequest', () => {
  it('update existing data with upsert', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
    )
    await doUpsert()
  })

  it('create new data with upsert', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
    )
    await doInsertUpsert()
  })

  it('create new data with GraphQL variables', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
    )
    await doInsertUpsertWithVars()
  })

  it('successfully performs upsert loadset', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            first:  string   @index(term) .
            last:   string   @index(hash) .
            age:    int      @index(int)  .
            when:   int                   .

            type Person {
                first
                last
                age
            }
        `,
    )
    await doUpserts()
    await checkIntegrity()
  })

  it('successfully performs upsert using JSON', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
    )
    await doJsonUpsert()
  })
})
