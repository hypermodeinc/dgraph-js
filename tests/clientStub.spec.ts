/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js'

import * as dgraph from '../src'

import { SERVER_ADDR, SERVER_CREDENTIALS, setup } from './helper'

function validateVersionObject(version: dgraph.Version) {
  const tag = version.getTag()
  expect(typeof tag).toEqual('string')
  expect(tag).toBeDefined()
}

async function checkVersion(stub: dgraph.DgraphClientStub): Promise<void> {
  validateVersionObject(await stub.checkVersion(new dgraph.Check()))
}

describe('clientStub', () => {
  describe('login', () => {
    it('Really should login', async () => {
      const client = await setup()
      const stub = client.anyClient()

      await expect(stub.login('groot', 'password')).resolves.toBeDefined()
    })
  })

  describe('checkVersion', () => {
    it('should check version', async () => {
      const client = await setup()
      await checkVersion(client.anyClient())
    })

    it('should check version with metadata', async () => {
      const clientStub = new dgraph.DgraphClientStub(
        SERVER_ADDR,
        SERVER_CREDENTIALS,
      )
      validateVersionObject(
        await clientStub.checkVersion(new dgraph.Check(), new grpc.Metadata()),
      )
    })

    it('should check version with call options', async () => {
      const clientStub = new dgraph.DgraphClientStub(
        SERVER_ADDR,
        SERVER_CREDENTIALS,
      )
      const p = clientStub.checkVersion(new dgraph.Check(), undefined, {
        credentials: undefined,
        deadline: 0,
        propagate_flags: grpc.propagate.DEFAULTS,
      })

      await expect(p).rejects.toBeDefined()
    })
  })

  describe('waitForReady', () => {
    it('should provide a promisified version of grpc.Client#waitForReady', async () => {
      const clientStub = new dgraph.DgraphClientStub(
        SERVER_ADDR,
        SERVER_CREDENTIALS,
      )
      await clientStub.waitForReady(Date.now() + 500)
      await checkVersion(clientStub)
    })
  })

  describe('close', () => {
    it('should close channel', async () => {
      const clientStub = new dgraph.DgraphClientStub(
        SERVER_ADDR,
        SERVER_CREDENTIALS,
      )
      clientStub.close()
      const p = clientStub.checkVersion(new dgraph.Check())
      await expect(p).rejects.toBeDefined()
    })
  })

  describe('grpcClient', () => {
    it('should close channel if grpc client is closed', async () => {
      const clientStub = new dgraph.DgraphClientStub(
        SERVER_ADDR,
        SERVER_CREDENTIALS,
      )
      clientStub.grpcClient().close()
      const p = clientStub.checkVersion(new dgraph.Check())
      await expect(p).rejects.toBeDefined()
    })
  })
})
