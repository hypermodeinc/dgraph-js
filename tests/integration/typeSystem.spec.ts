/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../../src'

import { setSchema, setup } from '../helper'

let client: dgraph.DgraphClient

async function performMutation() {
  const mu = new dgraph.Mutation()
  mu.setSetNquads(`
        _:prashant <name> "Prashant" .
        _:prashant <age> "23" .
        _:prashant <dgraph.type> "Person" .
    `)
  mu.setCommitNow(true)

  const resp = await client.newTxn().mutate(mu)
  expect(resp.getUidsMap().get('prashant')).toBeDefined()

  await expandQuery(1)
}

async function performDeletion() {
  const req = new dgraph.Request()
  const q = `query {
        me as var(func: eq(name, "Prashant"))
    }`
  req.setQuery(q)

  const mu = new dgraph.Mutation()
  mu.setDelNquads(`uid(me) * * .`)
  req.setMutationsList([mu])
  req.setCommitNow(true)

  const resp = await client.newTxn().doRequest(req)
  const uid = resp.getUidsMap().get('uid(me)')
  expect(uid).toBeUndefined()

  await expandQuery(0)
}

async function expandQuery(personCount: number) {
  const q = `{
        all(func: type(Person)) {
            expand(_all_)
        }
    }`
  const resp = await client.newTxn().query(q)
  const data = resp.getJson()
  expect(data.all.length).toEqual(personCount)
}

describe('Type system/directive', () => {
  it('query fields expand using type system', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:  string   @index(term) .
            age:    int      @index(int)  .

            type Person {
                name
                age
            }
        `,
    )

    await performMutation()
  })

  it('performs s * * delete', async () => {
    client = await setup()
    await setSchema(
      client,
      `
            name:  string   @index(term) .
            age:    int      @index(int)  .

            type Person {
                name
                age
            }
        `,
    )

    await performMutation()
    await performDeletion()
  })
})
