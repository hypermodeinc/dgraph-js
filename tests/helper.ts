/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from "@grpc/grpc-js";

import * as dgraph from "../src";

export const SERVER_ADDR = process.env.DGRAPH_SERVER_ADDR || "localhost:9080";
export const SERVER_CREDENTIALS = grpc.credentials.createInsecure();

export function createClientStub(): dgraph.DgraphClientStub {
	return new dgraph.DgraphClientStub(SERVER_ADDR, SERVER_CREDENTIALS);
}

export function createClient(
	clientStub: dgraph.DgraphClientStub,
): dgraph.DgraphClient {
	return new dgraph.DgraphClient(clientStub);
}

export function setSchema(
	c: dgraph.DgraphClient,
	schema: string,
): Promise<dgraph.Payload> {
	const op = new dgraph.Operation();
	op.setSchema(schema);
	return c.alter(op);
}

export function dropAll(c: dgraph.DgraphClient): Promise<dgraph.Payload> {
	const op = new dgraph.Operation();
	op.setDropAll(true);
	return c.alter(op);
}

export async function setup(): Promise<dgraph.DgraphClient> {
	const stub = new dgraph.DgraphClientStub(SERVER_ADDR, SERVER_CREDENTIALS);
	await stub.login("groot", "password");

	const c = new dgraph.DgraphClient(stub);

	await dropAll(c);
	return c;
}

export function wait(time: number): Promise<void> {
	return new Promise(
		(resolve: (value?: void | PromiseLike<void>) => void): void => {
			setTimeout(resolve, time);
		},
	);
}

export async function tryUpsert(
	client: dgraph.DgraphClient,
	query: string,
	mutation: dgraph.Mutation,
	blankNodeLabel: string,
): Promise<void> {
	const txn = client.newTxn();

	const req = new dgraph.Request();
	req.setQuery(query);
	req.setMutationsList([mutation]);
	req.setCommitNow(true);

	try {
		// Update account only if matching uid found.
		const response = await txn.doRequest(req);
		const uid = response.getUidsMap().get(blankNodeLabel);
		expect(uid).not.toEqual("");
	} finally {
		await txn.discard();
	}
}
