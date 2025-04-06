/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import type * as grpc from "@grpc/grpc-js";
import type * as messages from "../generated/api_pb";
import type { DgraphClient } from "./client";
import type * as types from "./types";
export type TxnOptions = {
	readOnly?: boolean;
	bestEffort?: boolean;
};
export declare class Txn {
	private readonly dc;
	private readonly ctx;
	private finished;
	private mutated;
	private readonly useReadOnly;
	private readonly useBestEffort;
	constructor(dc: DgraphClient, txnOpts?: TxnOptions);
	query(
		q: string,
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	queryWithVars(
		q: string,
		vars?: {
			[k: string]: any;
		},
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	queryRDF(
		q: string,
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	queryRDFWithVars(
		q: string,
		vars?: {
			[k: string]: any;
		},
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	mutate(
		mu: types.Mutation,
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	doRequest(
		req: messages.Request,
		metadata?: grpc.Metadata,
		options?: grpc.CallOptions,
	): Promise<types.Response>;
	commit(metadata?: grpc.Metadata, options?: grpc.CallOptions): Promise<void>;
	discard(metadata?: grpc.Metadata, options?: grpc.CallOptions): Promise<void>;
	private mergeContext;
}
