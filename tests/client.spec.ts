/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../src'

import { createClient, createClientStub } from './helper'

describe('client', () => {
  describe('constructor', () => {
    it('should throw no clients error if no client stubs are passed', () => {
      expect.assertions(1)

      try {
        new dgraph.DgraphClient()
      } catch (e) {
        expect(e).toBe(dgraph.ERR_NO_CLIENTS)
      }
    })

    it('should handle debug mode', () => {
      console.log = jest.fn()

      const msg = 'test message'
      const client = createClient(createClientStub())

      client.debug(msg)
      expect(console.log).not.toHaveBeenCalled()

      client.setDebugMode()
      client.debug(msg)
      expect(console.log).toHaveBeenCalledTimes(1)

      client.setDebugMode(false)
      client.debug(msg)
      expect(console.log).toHaveBeenCalledTimes(1)
    })
  })
})
