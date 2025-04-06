/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../../src'

import { setup } from '../helper'

describe('conflict', () => {
  it('aborts when TxnConflict raises exception', async () => {
    const client = await setup()

    const txn1 = client.newTxn()

    let mu = new dgraph.Mutation()
    mu.setSetNquads('_:alice <name> "Alice" .')
    const res = await txn1.mutate(mu)
    const uid = res.getUidsMap().get('alice')

    const txn2 = client.newTxn()
    mu = new dgraph.Mutation()
    mu.setSetNquads(`<${uid}> <name> "Alice" .`)
    await txn2.mutate(mu)

    const p1 = txn1.commit()
    await expect(p1).resolves.toBeUndefined()

    const p2 = txn2.commit()
    await expect(p2).rejects.toBe(dgraph.ERR_ABORTED)
  })

  it('aborts when TxnReadOnly raises exception', async () => {
    const client = await setup()
    const txnOption: dgraph.TxnOptions = {
      readOnly: true,
    }
    const txn1 = client.newTxn(txnOption)

    const mu = new dgraph.Mutation()
    mu.setSetNquads('_:alice <name> "Alice" .')
    const res = txn1.mutate(mu)
    await expect(res).rejects.toBe(dgraph.ERR_READ_ONLY)
  })

  it('aborts when TxnFinished raises exception', async () => {
    const client = await setup()

    const txn1 = client.newTxn()

    const mu = new dgraph.Mutation()
    mu.setSetNquads('_:alice <name> "Alice" .')
    const res = await txn1.mutate(mu)
    const uid = res.getUidsMap().get('alice')
    expect(uid).not.toBe('')

    const p1 = txn1.commit()
    await expect(p1).resolves.toBeUndefined()

    const p2 = txn1.commit()
    await expect(p2).rejects.toBe(dgraph.ERR_FINISHED)
  })
})
