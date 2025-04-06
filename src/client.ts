/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from "@grpc/grpc-js";

import * as messages from "../generated/api_pb";

import { DgraphClientStub } from "./clientStub";
import { ERR_NO_CLIENTS } from "./errors";
import { Txn, type TxnOptions } from "./txn";
import * as types from "./types";
import { isUnauthenticatedError, stringifyMessage } from "./util";

const dgraphScheme = "dgraph:";
const sslModeDisable = "disable";
const sslModeRequire = "require";
const sslModeVerifyCA = "verify-ca";

/**
 * Client is a transaction aware client to a set of Dgraph server instances.
 */
export class DgraphClient {
	private readonly clients: DgraphClientStub[];
	private debugMode = false;

	/**
	 * Creates a new Client for interacting with the Dgraph store.
	 *
	 * The client can be backed by multiple connections (to the same server, or
	 * multiple servers in a cluster).
	 */
	constructor(...clients: DgraphClientStub[]) {
		if (clients.length === 0) {
			throw ERR_NO_CLIENTS;
		}

		this.clients = clients;
	}

	/**
	 * By setting various fields of api.Operation, alter can be used to do the
	 * following:
	 *
	 * 1. Modify the schema.
	 *
	 * 2. Drop a predicate.
	 *
	 * 3. Drop the database.
	 */
	public async alter(
		op: messages.Operation,
		metadata?: grpc.Metadata | null,
		options?: grpc.CallOptions | null,
	): Promise<types.Payload> {
		this.debug(`Alter request:\n${stringifyMessage(op)}`);

		const c = this.anyClient();
		let payload: messages.Payload;
		const operation = async () => c.alter(op, metadata, options);
		try {
			payload = await operation();
		} catch (e) {
			if (isJwtExpired(e) === true) {
				await c.retryLogin(metadata, options);
				payload = await operation();
			} else {
				throw e;
			}
		}
		const pl: types.Payload = types.createPayload(payload);
		this.debug(`Alter response:\n${stringifyMessage(pl)}`);

		return pl;
	}

	/**
	 * newTxn creates a new transaction.
	 */
	public newTxn(txnOpts?: TxnOptions): Txn {
		return new Txn(this, txnOpts);
	}

	/**
	 * setDebugMode switches on/off the debug mode which prints helpful debug messages
	 * while performing alters, queries and mutations.
	 */
	public setDebugMode(mode = true): void {
		this.debugMode = mode;
	}

	/**
	 * debug prints a message on the console if debug mode is switched on.
	 */
	public debug(msg: string): void {
		if (this.debugMode) {
			console.log(msg);
		}
	}

	public anyClient(): DgraphClientStub {
		return this.clients[Math.floor(Math.random() * this.clients.length)];
	}

	public close(): void {
		this.clients.forEach((clientStub) => {
			try {
				clientStub.close(); // Call the close method on each client stub
				console.log("Closed client stub successfully");
			} catch (error) {
				console.error("Failed to close client stub:", error);
			}
		});
	}
}

// isJwtExpired returns true if the error indicates that the jwt has expired.
export function isJwtExpired(err: any): boolean {
	if (!err) {
		return false;
	}
	return isUnauthenticatedError(err);
}

/**
 * deleteEdges sets the edges corresponding to predicates on the node with the
 * given uid for deletion.
 *
 * This helper function doesn't run the mutation on the server. It must be done
 * by the user after the function returns.
 */
export function deleteEdges(
	mu: types.Mutation,
	uid: string,
	...predicates: string[]
): void {
	for (const predicate of predicates) {
		const nquad = new messages.NQuad();
		nquad.setSubject(uid);
		nquad.setPredicate(predicate);

		const ov = new messages.Value();
		ov.setDefaultVal("_STAR_ALL");
		nquad.setObjectValue(ov);

		mu.addDel(nquad);
	}
}

function addApiKeyToCredentials(
	baseCreds: grpc.ChannelCredentials,
	apiKey: string,
): grpc.ChannelCredentials {
	const metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_, callback) => {
			const metadata = new grpc.Metadata();
			metadata.add("authorization", apiKey);
			callback(null, metadata);
		},
	);
	return grpc.credentials.combineChannelCredentials(baseCreds, metaCreds);
}

function addBearerTokenToCredentials(
	baseCreds: grpc.ChannelCredentials,
	bearerToken: string,
): grpc.ChannelCredentials {
	const metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_, callback) => {
			const metadata = new grpc.Metadata();
			metadata.add("Authorization", `Bearer ${bearerToken}`);
			callback(null, metadata);
		},
	);
	return grpc.credentials.combineChannelCredentials(baseCreds, metaCreds);
}

export async function open(connStr: string): Promise<DgraphClient> {
	const parsedUrl = new URL(connStr);
	if (parsedUrl.protocol !== dgraphScheme) {
		throw new Error("Invalid scheme: must start with dgraph://");
	}

	const host = parsedUrl.hostname;
	const port = parsedUrl.port;
	if (!host) {
		throw new Error("Invalid connection string: hostname required");
	}
	if (!port) {
		throw new Error("Invalid connection string: port required");
	}

	// Parse query parameters using searchParams
	const queryParams: Record<string, string> = {};
	if (parsedUrl.searchParams) {
		parsedUrl.searchParams.forEach((value, key) => {
			queryParams[key] = value;
		});
	}

	if (queryParams.apikey && queryParams.bearertoken) {
		throw new Error("Both apikey and bearertoken cannot be provided");
	}

	let sslMode = queryParams.sslmode;
	if (sslMode === undefined) {
		sslMode = sslModeDisable;
	}

	let credentials;
	switch (sslMode) {
		case sslModeDisable:
			credentials = grpc.credentials.createInsecure();
			break;
		case sslModeRequire:
			credentials = grpc.credentials.createSsl(null, null, null, {
				checkServerIdentity: () => undefined, // Skip certificate verification
			});
			break;
		case sslModeVerifyCA:
			credentials = grpc.credentials.createSsl(); // Use system CA for verification
			break;
		default:
			throw new Error(
				`Invalid SSL mode: ${sslMode} (must be one of disable, require, verify-ca)`,
			);
	}

	// Add API key or Bearer token to credentials if provided
	if (queryParams.apikey) {
		credentials = addApiKeyToCredentials(credentials, queryParams.apikey);
	} else if (queryParams.bearertoken) {
		credentials = addBearerTokenToCredentials(
			credentials,
			queryParams.bearertoken,
		);
	}

	const clientStub = new DgraphClientStub(`${host}:${port}`, credentials);

	if (parsedUrl.username != "") {
		if (parsedUrl.password === "") {
			throw new Error(
				"Invalid connection string: password required when username is provided",
			);
		} else {
			try {
				await clientStub.login(parsedUrl.username, parsedUrl.password);
			} catch (err) {
				throw new Error(`Failed to sign in user: ${err.message}`);
			}
		}
	}

	return new DgraphClient(clientStub);
}
