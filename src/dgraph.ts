/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

// Export all the required message types.
export * from "./types";
export {
	Operation,
	Request,
	TxnContext,
	Check,
	Version,
	NQuad,
	Value,
	Facet,
	Latency,
} from "../generated/api_pb";

// Export DgraphClientStub class.
export * from "./clientStub";

// Export DgraphClient class and deleteEdges function.
export * from "./client";

//Export clientStubFromSlashGraphQLEndpoint function.
export * from "./clientStubFromSlash";

// Export Txn class.
export * from "./txn";

// Export error constants.
export * from "./errors";

export * as grpc from "@grpc/grpc-js";
