/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../src'

import { setSchema, setup } from './helper'

const timeout = 1 * 60 * 1000 // 1 minute in milliseconds

jest.setTimeout(timeout * 2)

let client: dgraph.DgraphClient

describe('txn', () => {
  describe('queryWithVars', () => {
    let uid
    beforeAll(async () => {
      client = await setup()
      await setSchema(client, 'name: string @index(exact) .')

      const mu = new dgraph.Mutation()
      mu.setCommitNow(true)
      mu.setSetNquads('_:alice <name> "Alice" .')
      const mutres = await client.newTxn().mutate(mu)
      uid = mutres.getUidsMap().get('alice')
    })

    it('should query with variables', async () => {
      let res = await client
        .newTxn()
        .queryWithVars(
          'query me($a: string) { me(func: eq(name, $a)) { name }}',
          {
            $a: 'Alice',
          },
        )
      let resJson: {
        me: { name: string }[]
      } = res.getJson()
      expect(resJson.me).toHaveLength(1)
      expect(resJson.me[0].name).toEqual('Alice')

      res = await client
        .newTxn()
        .queryWithVars(
          'query me($a: string) { me(func: eq(name, $a)) { name }}',
          {
            $a: new String('Alice'),
            $b: true,
          },
        )
      resJson = res.getJson()
      expect(resJson.me).toHaveLength(1)
      expect(resJson.me[0].name).toEqual('Alice')
    })

    it('should query with variables RDF', async () => {
      let res = await client
        .newTxn()
        .queryRDFWithVars(
          'query me($a: string) { me(func: eq(name, $a)) { name }}',
          {
            $a: 'Alice',
          },
        )
      let resRdf = res.getRdf_asB64()
      let buff = Buffer.from(resRdf, 'base64')
      expect(buff.toString('utf-8')).toEqual(`<${uid}> <name> "Alice" .\n`)

      res = await client
        .newTxn()
        .queryRDFWithVars(
          'query me($a: string) { me(func: eq(name, $a)) { name }}',
          {
            $a: new String('Alice'),
            $b: true,
          },
        )
      resRdf = res.getRdf_asB64()
      buff = Buffer.from(resRdf, 'base64')
      expect(buff.toString('utf-8')).toEqual(`<${uid}> <name> "Alice" .\n`)
    })

    it('should ignore properties with non-string values', async () => {
      const res = await client
        .newTxn()
        .queryWithVars(
          'query me($a: string) { me(func: eq(name, $a)) { name }}',
          {
            $a: 1, // non-string properties are ignored
          },
        )
      const resJson: {
        me: { name: string }[]
      } = res.getJson()
      expect(resJson.me).toHaveLength(0)
    })

    it('should throw finished error if txn is already finished', async () => {
      const txn = client.newTxn()
      await txn.commit()

      const p = txn.query('{ me(func: eq(name, "Alice")) { name }}')
      await expect(p).rejects.toBe(dgraph.ERR_FINISHED)
    })

    it('should succeed without increasing startTs (readOnly=true)', async () => {
      const res = await client
        .newTxn()
        .query('{ me(func: eq(name, "Alice")) { name }}')
      const startTs = res.getTxn().getStartTs()
      const res2 = await client
        .newTxn({ readOnly: true })
        .query('{ me(func: eq(name, "Alice")) { name }}')
      const startTs2 = res2.getTxn().getStartTs()
      expect(startTs).not.toBe(startTs2) // we expect these to be different, the first query increases startTs
      const res3 = await client
        .newTxn({ readOnly: true })
        .query('{ me(func: eq(name, "Alice")) { name }}')
      const startTs3 = res3.getTxn().getStartTs()
      expect(startTs2).toBe(startTs3) // we expect these to be same, because readOnly doesn't increase startTs
    })

    it('should succeed without error (readOnly=true, bestEffort=true)', async () => {
      const res = await client
        .newTxn()
        .query('{ me(func: eq(name, "Alice")) { name }}')
      const startTs = res.getTxn().getStartTs()
      const res2 = await client
        .newTxn({ readOnly: true, bestEffort: true })
        .query('{ me(func: eq(name, "Alice")) { name }}')
      const startTs2 = res2.getTxn().getStartTs()
      expect(startTs2).toBeGreaterThanOrEqual(startTs)
    })

    it('should throw error (readOnly=false, bestEffort=true)', () => {
      const test = () => client.newTxn({ bestEffort: true })
      expect(test).toThrow(dgraph.ERR_BEST_EFFORT_REQUIRED_READ_ONLY)
    })
  })

  describe('mutate', () => {
    beforeAll(async () => {
      client = await setup()
      await setSchema(client, 'name: string @index(exact) .')
    })

    it('should throw finished error if txn is already finished', async () => {
      const txn = client.newTxn()
      await txn.commit()

      const mu = new dgraph.Mutation()
      mu.setSetNquads('_:alice <name> "Alice" .')
      const p = txn.mutate(mu)
      await expect(p).rejects.toBe(dgraph.ERR_FINISHED)
    })

    it('should throw error and discard if Stub.mutate throws an error', async () => {
      const txn = client.newTxn()

      const mu = new dgraph.Mutation()
      // There is an error in the mutation NQuad.
      mu.setSetNquads('alice <name> "Alice" .')
      const p1 = txn.mutate(mu)
      await expect(p1).rejects.toBeDefined()

      const p2 = txn.commit()
      await expect(p2).rejects.toBe(dgraph.ERR_FINISHED)
    })
  })

  describe('commit', () => {
    beforeAll(async () => {
      client = await setup()
      await setSchema(client, 'name: string @index(exact) .')
    })

    it('should throw finished error if txn is already finished', async () => {
      const txn = client.newTxn()
      await txn.commit()

      const p = txn.commit()
      await expect(p).rejects.toBe(dgraph.ERR_FINISHED)
    })

    it('should throw finished error after mutation with commitNow', async () => {
      const txn = client.newTxn()

      const mu = new dgraph.Mutation()
      mu.setSetNquads('_:alice <name> "Alice" .')
      mu.setCommitNow(true)
      await txn.mutate(mu)

      const p = txn.commit()
      await expect(p).rejects.toBe(dgraph.ERR_FINISHED)
    })
  })

  describe('discard', () => {
    beforeAll(async () => {
      client = await setup()
      await setSchema(client, 'name: string @index(exact) .')
    })

    it('should resolve and do nothing if txn is already finished', async () => {
      const txn = client.newTxn()
      await txn.commit()

      const p = txn.discard()
      await expect(p).resolves.toBeUndefined()
    })

    it('should resolve and do nothing after mutation with commitNow', async () => {
      const txn = client.newTxn()

      const mu = new dgraph.Mutation()
      mu.setSetNquads('_:alice <name> "Alice" .')
      mu.setCommitNow(true)
      await txn.mutate(mu)

      const p = txn.discard()
      await expect(p).resolves.toBeUndefined()
    })
  })
})
