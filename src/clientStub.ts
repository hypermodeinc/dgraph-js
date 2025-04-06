/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js'

import * as services from '../generated/api_grpc_pb'
import * as messages from '../generated/api_pb'

import { ERR_REFRESH_JWT_EMPTY } from './errors'
import { promisify1, promisify3 } from './util'

/**
 * Stub is a stub/client connecting to a single dgraph server instance.
 */
export class DgraphClientStub {
  private readonly stub: services.DgraphClient

  private accessJwt = ''
  private refreshJwt = ''

  private readonly promisified: {
    login(
      req: messages.LoginRequest,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.Response>

    alter(
      op: messages.Operation,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.Payload>

    query(
      req: messages.Request,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.Response>

    mutate(
      mu: messages.Mutation,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.Response>

    commitOrAbort(
      ctx: messages.TxnContext,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.TxnContext>

    checkVersion(
      check: messages.Check,
      metadata?: grpc.Metadata,
      options?: grpc.CallOptions,
    ): Promise<messages.Version>

    waitForReady(deadline: grpc.Deadline): Promise<void>
  }

  constructor(
    addr?: string,
    credentials?: grpc.ChannelCredentials,
    options?: object,
  ) {
    if (addr === undefined) {
      addr = 'localhost:9080'
    }
    if (credentials === undefined) {
      credentials = grpc.credentials.createInsecure()
    }

    this.stub = new services.DgraphClient(addr, credentials, options)
    this.promisified = {
      login: promisify3(this.stub.login, this.stub),
      alter: promisify3(this.stub.alter, this.stub),
      query: promisify3(this.stub.query, this.stub),
      mutate: promisify3(this.stub.mutate, this.stub),
      commitOrAbort: promisify3(this.stub.commitOrAbort, this.stub),
      checkVersion: promisify3(this.stub.checkVersion, this.stub),
      waitForReady: promisify1(this.stub.waitForReady, this.stub),
    }
  }

  public async login(
    userid?: string,
    password?: string,
    refreshJwt?: string,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Jwt> {
    return this.loginIntoNamespace(
      userid,
      password,
      0,
      refreshJwt,
      metadata,
      options,
    )
  }

  public async loginIntoNamespace(
    userid?: string,
    password?: string,
    namespace?: number,
    refreshJwt?: string,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Jwt> {
    const req = new messages.LoginRequest()
    if (userid !== undefined) {
      req.setUserid(userid)
      req.setPassword(password)
      req.setNamespace(namespace)
    } else if (refreshJwt !== undefined) {
      // Use the caller-supplied refreshJwt
      req.setRefreshToken(refreshJwt)
    } else {
      req.setRefreshToken(this.refreshJwt)
    }
    const resp = await this.promisified.login(
      req,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
    const jwtResponse = messages.Jwt.deserializeBinary(resp.getJson_asU8())
    this.accessJwt = jwtResponse.getAccessJwt()
    this.refreshJwt = jwtResponse.getRefreshJwt()
    return jwtResponse
  }

  public alter(
    op: messages.Operation,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Payload> {
    return this.promisified.alter(
      op,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
  }

  public async retryLogin(
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Jwt> {
    if (this.refreshJwt.length === 0) {
      throw ERR_REFRESH_JWT_EMPTY
    }
    const req = new messages.LoginRequest()
    req.setRefreshToken(this.refreshJwt)
    const resp = await this.promisified.login(
      req,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
    const jwtResponse = messages.Jwt.deserializeBinary(resp.getJson_asU8())
    this.accessJwt = jwtResponse.getAccessJwt()
    this.refreshJwt = jwtResponse.getRefreshJwt()
    return jwtResponse
  }

  public query(
    req: messages.Request,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Response> {
    return this.promisified.query(
      req,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
  }

  public mutate(
    mu: messages.Mutation,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Response> {
    return this.promisified.mutate(
      mu,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
  }

  public commitOrAbort(
    ctx: messages.TxnContext,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.TxnContext> {
    return this.promisified.commitOrAbort(
      ctx,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
  }

  public checkVersion(
    check: messages.Check,
    metadata?: grpc.Metadata,
    options?: grpc.CallOptions,
  ): Promise<messages.Version> {
    return this.promisified.checkVersion(
      check,
      this.ensureMetadata(metadata),
      ensureCallOptions(options),
    )
  }

  public waitForReady(deadline: grpc.Deadline): Promise<void> {
    return this.promisified.waitForReady(deadline)
  }

  public close(): void {
    return this.stub.close()
  }

  public grpcClient(): grpc.Client {
    return this.stub
  }

  private ensureMetadata(metadata?: grpc.Metadata): grpc.Metadata {
    const newMeta = metadata === undefined ? new grpc.Metadata() : metadata
    if (this.accessJwt !== '') {
      newMeta.set('accessJwt', this.accessJwt)
    }
    return newMeta
  }
}

function ensureCallOptions(options?: grpc.CallOptions): grpc.CallOptions {
  return options === undefined
    ? {
        propagate_flags: grpc.propagate.DEFAULTS,
        credentials: undefined,
      }
    : options
}
