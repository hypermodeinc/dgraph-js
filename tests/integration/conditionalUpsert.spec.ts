/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../../src'

import { setSchema, setup, tryUpsert } from '../helper'

let client: dgraph.DgraphClient

type Profile = {
  uid?: string
  name?: string
  email?: string
  age?: number
  friend?: [Profile]
}
const profiles: Profile[] = [
  { uid: '_:alice', name: 'Alice', email: 'alice@dgraph.io', age: 25 },
  { uid: '_:bob', name: 'Bob', email: 'bob@dgraph.io', age: 28 },
  {
    uid: '_:prashant',
    name: 'Prashant',
    email: 'prashant@dgraph.io',
    age: 23,
  },
]
const names: string[] = []
profiles.forEach((profile: Profile): void => {
  names.push(profile.name)
})

async function performMutation(person: Profile): Promise<string> {
  const txn = client.newTxn()

  const mu = new dgraph.Mutation()
  mu.setSetJson(person)

  const res = await txn.mutate(mu)
  await txn.commit()
  const uid = res.getUidsMap().get(person.uid.slice(2))
  expect(uid).not.toEqual('')
  return uid
}

async function doConditionalUpsert(): Promise<void> {
  const p1: Profile = { uid: await performMutation(profiles[0]) }
  const p2: Profile = { uid: await performMutation(profiles[1]) }
  const friends: [Profile] = [p1]
  friends.push(p2)
  const alphaProfile: Profile = {
    uid: profiles[2].uid,
    name: profiles[2].name,
    email: profiles[2].email,
    age: profiles[2].age,
    friend: friends,
  }
  await performMutation(alphaProfile)

  const profile: Profile = {
    uid: 'uid(profile)',
    name: 'Prashant Shahi',
    email: 'prashant@dgraph.io',
    age: 24,
  }
  const query = `query {
        profile as var(func: eq(email, "${profile.email}")) {
            friends as friend
        }
    }`
  const mu = new dgraph.Mutation()
  mu.setCond(`@if(eq(len(friends), 2))`)
  mu.setSetNquads(`
        uid(profile) <name> "${profile.name}" .
        uid(profile) <email>  "${profile.email}" .
        uid(profile) <age>   "${profile.age}"^^<xs:int> .
    `)

  await tryUpsert(client, query, mu, profile.uid)
}

async function checkUpsertIntegrity(expectedObject: Profile): Promise<void> {
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

  expect(Object.keys(profileSet).length).toEqual(1)
  expect(receivedObject).toEqual(expectedObject)
}

async function doUnconditionalUpsert(): Promise<void> {
  const p1: Profile = { uid: await performMutation(profiles[0]) }
  const p2: Profile = { uid: await performMutation(profiles[1]) }
  const friends: [Profile] = [p1]
  friends.push(p2)
  const alphaProfile: Profile = {
    uid: profiles[2].uid,
    name: profiles[2].name,
    email: profiles[2].email,
    age: profiles[2].age,
    friend: friends,
  }
  await performMutation(alphaProfile)

  const profile: Profile = {
    uid: 'uid(profile)',
    name: 'Prashant Shahi',
    email: 'prashant@dgraph.io',
    age: 24,
  }
  const query = `query {
        profile as var(func: eq(email, "${profile.email}")) {
            friends as friend
        }
    }`
  const mu = new dgraph.Mutation()
  mu.setCond(`@if(gt(len(friends), 2))`)
  mu.setSetNquads(`
        uid(profile) <name> "${profile.name}" .
        uid(profile) <email>  "${profile.email}" .
        uid(profile) <age>   "${profile.age}"^^<xs:int> .
    `)

  await tryUpsert(client, query, mu, profile.uid)
}

describe('conditional upsert', () => {
  it('successfully perform conditional upsert', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:    string    @index(term)  .
            email:   string    @index(exact) .
            age:     int       @index(int)   .
            friend:  [uid]     @reverse      .
        `,
    )
    await doConditionalUpsert()
    const expectedObject: Profile = {
      name: 'Prashant Shahi',
      email: 'prashant@dgraph.io',
      age: 24,
    }
    await checkUpsertIntegrity(expectedObject)
  })

  it('when @if condition is false, do not perform upsert', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:  string   @index(term) .
            email:   string   @index(exact) .
            age:    int      @index(int)  .
            friend: [uid]      @reverse     .
        `,
    )
    await doUnconditionalUpsert()
    const expectedObject: Profile = {
      name: 'Prashant',
      email: 'prashant@dgraph.io',
      age: 23,
    }
    await checkUpsertIntegrity(expectedObject)
  })
})
