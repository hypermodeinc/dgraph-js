/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src";

import { setSchema, setup } from "../helper";

const data = ["200", "300", "400"];

describe("mutate", () => {
	it("should insert 3Quads", async () => {
		const client = await setup();
		await setSchema(client, "name: string @index(fulltext) .");

		const uids: string[] = [];
		let txn = client.newTxn();
		try {
			for (const datum of data) {
				const nquad = new dgraph.NQuad();
				nquad.setSubject(`_:${datum}`);
				nquad.setPredicate("name");

				const ov = new dgraph.Value();
				ov.setStrVal(`ok ${datum}`);
				nquad.setObjectValue(ov);

				const mu = new dgraph.Mutation();
				mu.addSet(nquad);

				const ag = await txn.mutate(mu);
				uids.push(ag.getUidsMap().get(datum));
			}

			await txn.commit();
		} finally {
			await txn.discard();
		}

		txn = client.newTxn();
		const query = `{ me(func: uid(${uids.join(",")})) { name }}`;
		const res = await txn.query(query);
		await txn.commit();

		expect(res.getJson()).toEqual({
			me: [{ name: "ok 200" }, { name: "ok 300" }, { name: "ok 400" }],
		});
	});

	it("should insert vector", async () => {
		const client = await setup();
		await setSchema(
			client,
			`project_discription_v: float32vector @index(hnsw(exponent: "5", metric: "euclidean")) .`,
		);

		let txn = client.newTxn();
		try {
			const nquad = new dgraph.NQuad();
			nquad.setSubject(`0x1011`);
			nquad.setPredicate("project_discription_v");

			const ov = new dgraph.Value();
			const vector = new Float32Array([5.1, 5.1, 1.1]);
			const uint8Array = new Uint8Array(vector.buffer);
			ov.setVfloat32Val(uint8Array);
			nquad.setObjectValue(ov);

			const mu = new dgraph.Mutation();
			mu.addSet(nquad);
			await txn.mutate(mu);
			await txn.commit();
		} finally {
			await txn.discard();
		}

		txn = client.newTxn();
		const query = `query {  q (func: uid(0x1011)) {
                          uid
                          project_discription_v
  
                         } 
					} `;
		const res = await txn.query(query);
		await txn.commit();
		expect(res.getJson()).toEqual({
			q: [
				{
					uid: "0x1011",
					project_discription_v: [5.1, 5.1, 1.1],
				},
			],
		});
	});
});
