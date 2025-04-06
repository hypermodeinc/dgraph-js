/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import type * as grpc from '@grpc/grpc-js'
import type * as messages from '../generated/api_pb'
import type { DgraphClientStub } from './clientStub'
import type { Txn, TxnOptions } from './txn'
import type * as types from './types'
export declare class DgraphClient {
  private readonly clients
  private debugMode
  constructor(...clients: DgraphClientStub[])
  alter(
    op: messages.Operation,
    metadata?: grpc.Metadata | null,
    options?: grpc.CallOptions | null,
  ): Promise<types.Payload>
  newTxn(txnOpts?: TxnOptions): Txn
  setDebugMode(mode?: boolean): void
  debug(msg: string): void
  anyClient(): DgraphClientStub
  close(): void
}
export declare function isJwtExpired(err: any): boolean
export declare function deleteEdges(
  mu: types.Mutation,
  uid: string,
  ...predicates: string[]
): void
export declare function open(connStr: string): Promise<DgraphClient>
