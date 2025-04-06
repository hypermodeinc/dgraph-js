/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src";

import { setSchema, setup } from "../helper";

const data = ["200", "300", "400"];
const UNKNOWN_CODE = "2 UNKNOWN";

async function createMutation(element: object) {
	const mu = new dgraph.Mutation();
	mu.setSetJson(element);
	return mu;
}

describe("doRequest", () => {
	it("insert 3Quads(mutation) and then query finishes successfully", async () => {
		const client = await setup();
		await setSchema(client, "name: string @index(fulltext) .");

		const uids: string[] = [];
		let res: dgraph.Response;
		let req: dgraph.Request;
		for (const datum of data) {
			const nquad = new dgraph.NQuad();
			nquad.setSubject(`_:${datum}`);
			nquad.setPredicate("name");

			const objectValue = new dgraph.Value();
			objectValue.setStrVal(`ok ${datum}`);
			nquad.setObjectValue(objectValue);

			const mu = new dgraph.Mutation();
			mu.addSet(nquad);

			req = new dgraph.Request();
			req.setMutationsList([mu]);
			req.setCommitNow(true);

			res = await client.newTxn().doRequest(req);
			uids.push(res.getUidsMap().get(datum));
		}
		const query = `{ me(func: uid(${uids.join(",")})) { name }}`;
		req = new dgraph.Request();
		req.setQuery(query);
		res = await client.newTxn().doRequest(req);

		expect(res.getJson()).toEqual({
			me: [{ name: "ok 200" }, { name: "ok 300" }, { name: "ok 400" }],
		});
	});

	it("performs two mutations and then query finishes successfully", async () => {
		const client = await setup();
		await setSchema(
			client,
			`
            name: string @index(fulltext) .
        `,
		);
		const dataSet = [{ name: `ok ${data[0]}` }, { name: `ok ${data[1]}` }];
		const mu1 = await createMutation(dataSet[0]);
		const mu2 = await createMutation(dataSet[1]);
		const req = new dgraph.Request();
		req.setMutationsList([mu1, mu2]);
		req.setCommitNow(true);
		const resp = client.newTxn().doRequest(req);
		await expect(resp).resolves.toBeDefined();

		const query = `{ me(func: has(name), orderasc: name) { name }}`;
		const res = await client.newTxn().query(query);
		expect(res.getJson()).toEqual({
			me: [{ name: "ok 200" }, { name: "ok 300" }],
		});
	});

	it("fails with zero mutations since either a mutation or a query is required", async () => {
		const client = await setup();
		await setSchema(
			client,
			`
            name: string @index(fulltext) .
        `,
		);

		const req = new dgraph.Request();
		req.setCommitNow(true);

		const res = client.newTxn().doRequest(req);
		const EMPTY_ERROR = new Error(`${UNKNOWN_CODE}: empty request`);
		await expect(res).rejects.toEqual(EMPTY_ERROR);
	});
});
