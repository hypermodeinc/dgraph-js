/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as messages from "../generated/api_pb"
export declare class Payload extends messages.Payload {
  getData(): any
  getData_asB64(): string
  getData_asU8(): Uint8Array
  setData(value: any): void
}
export declare function createPayload(oldPayload: messages.Payload): Payload
export declare class Response extends messages.Response {
  getJson(): any
  getJson_asB64(): string
  getJson_asU8(): Uint8Array
  setJson(value: any): void
}
export declare function createResponse(oldResponse: messages.Response): Response
export declare class Mutation extends messages.Mutation {
  getSetJson(): any
  getSetJson_asB64(): string
  getSetJson_asU8(): Uint8Array
  setSetJson(value: any): void
  getDeleteJson(): any
  getDeleteJson_asB64(): string
  getDeleteJson_asU8(): Uint8Array
  setDeleteJson(value: any): void
  getSetNquads(): Uint8Array | string
  getSetNquads_asB64(): string
  getSetNquads_asU8(): Uint8Array
  setSetNquads(value: Uint8Array | string): void
  getDelNquads(): Uint8Array | string
  getDelNquads_asB64(): string
  getDelNquads_asU8(): Uint8Array
  setDelNquads(value: Uint8Array | string): void
}
