/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from '../src'
import { b64ToStr, strToB64, strToU8, u8ToStr } from '../src/util'

const obj = { k1: 'v1' }
const setNquads = '_:alice <name> "Alice"'
const delNquads = '<0x7569> * * .'

describe('types', () => {
  describe('Payload', () => {
    it('should set and get data', () => {
      const p = new dgraph.Payload()

      p.setData(obj)
      let o = p.getData()
      expect(o).toEqual(obj)

      p.setData(strToB64(JSON.stringify(obj)))
      o = p.getData()
      expect(o).toEqual(obj)

      p.setData(strToU8(JSON.stringify(obj)))
      o = p.getData()
      expect(o).toEqual(obj)
    })

    it('should get data as b64', () => {
      const p = new dgraph.Payload()
      p.setData(obj)

      const b64 = p.getData_asB64()
      const o = JSON.parse(b64ToStr(b64))
      expect(o).toEqual(obj)
    })

    it('should get data as u8', () => {
      const p = new dgraph.Payload()
      p.setData(obj)

      const u8 = p.getData_asU8()
      const o = JSON.parse(u8ToStr(u8))
      expect(o).toEqual(obj)
    })
  })

  describe('Response', () => {
    it('should set and get json', () => {
      const p = new dgraph.Response()

      p.setJson(obj)
      let o = p.getJson()
      expect(o).toEqual(obj)

      p.setJson(strToB64(JSON.stringify(obj)))
      o = p.getJson()
      expect(o).toEqual(obj)

      p.setJson(strToU8(JSON.stringify(obj)))
      o = p.getJson()
      expect(o).toEqual(obj)
    })

    it('should get json as b64', () => {
      const p = new dgraph.Response()
      p.setJson(obj)

      const b64 = p.getJson_asB64()
      const o = JSON.parse(b64ToStr(b64))
      expect(o).toEqual(obj)
    })

    it('should get json as u8', () => {
      const p = new dgraph.Response()
      p.setJson(obj)

      const u8 = p.getJson_asU8()
      const o = JSON.parse(u8ToStr(u8))
      expect(o).toEqual(obj)
    })
  })

  describe('Mutation', () => {
    it('should set and get setJson', () => {
      const p = new dgraph.Mutation()

      p.setSetJson(obj)
      let o = p.getSetJson()
      expect(o).toEqual(obj)

      p.setSetJson(strToB64(JSON.stringify(obj)))
      o = p.getSetJson()
      expect(o).toEqual(obj)

      p.setSetJson(strToU8(JSON.stringify(obj)))
      o = p.getSetJson()
      expect(o).toEqual(obj)
    })

    it('should get setJson as b64', () => {
      const p = new dgraph.Mutation()
      p.setSetJson(obj)

      const b64 = p.getSetJson_asB64()
      const o = JSON.parse(b64ToStr(b64))
      expect(o).toEqual(obj)
    })

    it('should get setJson as u8', () => {
      const p = new dgraph.Mutation()
      p.setSetJson(obj)

      const u8 = p.getSetJson_asU8()
      const o = JSON.parse(u8ToStr(u8))
      expect(o).toEqual(obj)
    })

    it('should set and get deleteJson', () => {
      const p = new dgraph.Mutation()

      p.setDeleteJson(obj)
      let o = p.getDeleteJson()
      expect(o).toEqual(obj)

      p.setDeleteJson(strToB64(JSON.stringify(obj)))
      o = p.getDeleteJson()
      expect(o).toEqual(obj)

      p.setDeleteJson(strToU8(JSON.stringify(obj)))
      o = p.getDeleteJson()
      expect(o).toEqual(obj)
    })

    it('should get deleteJson as b64', () => {
      const p = new dgraph.Mutation()
      p.setDeleteJson(obj)

      const b64 = p.getDeleteJson_asB64()
      const o = JSON.parse(b64ToStr(b64))
      expect(o).toEqual(obj)
    })

    it('should get deleteJson as u8', () => {
      const p = new dgraph.Mutation()
      p.setDeleteJson(obj)

      const u8 = p.getDeleteJson_asU8()
      const o = JSON.parse(u8ToStr(u8))
      expect(o).toEqual(obj)
    })

    it('should set and get setNquads', () => {
      const p = new dgraph.Mutation()

      p.setSetNquads(setNquads)
      let nq = p.getSetNquads()
      expect(nq).toEqual(setNquads)

      p.setSetNquads(strToB64(setNquads))
      nq = p.getSetNquads()
      expect(nq).toEqual(setNquads)

      p.setSetNquads(strToU8(setNquads))
      nq = p.getSetNquads()
      expect(nq).toEqual(setNquads)
    })

    it('should get setNquads as b64', () => {
      const p = new dgraph.Mutation()
      p.setSetNquads(setNquads)

      const b64 = p.getSetNquads_asB64()
      const nq = b64ToStr(b64)
      expect(nq).toEqual(setNquads)
    })

    it('should get setNquads as u8', () => {
      const p = new dgraph.Mutation()
      p.setSetNquads(setNquads)

      const u8 = p.getSetNquads_asU8()
      const nq = u8ToStr(u8)
      expect(nq).toEqual(setNquads)
    })

    it('should set and get delNquads', () => {
      const p = new dgraph.Mutation()

      p.setDelNquads(delNquads)
      let nq = p.getDelNquads()
      expect(nq).toEqual(delNquads)

      p.setDelNquads(strToB64(delNquads))
      nq = p.getDelNquads()
      expect(nq).toEqual(delNquads)

      p.setDelNquads(strToU8(delNquads))
      nq = p.getDelNquads()
      expect(nq).toEqual(delNquads)
    })

    it('should get delNquads as b64', () => {
      const p = new dgraph.Mutation()
      p.setDelNquads(delNquads)

      const b64 = p.getDelNquads_asB64()
      const nq = b64ToStr(b64)
      expect(nq).toEqual(delNquads)
    })

    it('should get delNquads as u8', () => {
      const p = new dgraph.Mutation()
      p.setDelNquads(delNquads)

      const u8 = p.getDelNquads_asU8()
      const nq = u8ToStr(u8)
      expect(nq).toEqual(delNquads)
    })
  })
})
