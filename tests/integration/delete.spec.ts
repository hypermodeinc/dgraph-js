/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src";

import { setSchema, setup } from "../helper";

let client: dgraph.DgraphClient;

async function performUpsert(mu: dgraph.Mutation, query: string, vars: object) {
	const req = new dgraph.Request();
	req.addMutations(mu);
	req.setQuery(query);
	req.setCommitNow(true);
	if (vars !== undefined) {
		const varsMap = req.getVarsMap();
		req.setQuery(query);
		Object.keys(vars).forEach((key: string) => {
			varsMap.set(key, vars[key]);
		});
	}
	await expect(client.newTxn().doRequest(req)).resolves.toBeDefined();
}

async function performMutation(
	mu: dgraph.Mutation,
	blankNodeLabel: string,
): Promise<string> {
	mu.setCommitNow(true);
	const res = await client.newTxn().mutate(mu);
	const uid = res.getUidsMap().get(blankNodeLabel);
	expect(uid).not.toEqual("");
	return uid;
}

async function performJsonMutation(
	jsonObj: object,
	blankNodeLabel: string,
): Promise<string> {
	const mu = new dgraph.Mutation();
	mu.setSetJson(jsonObj);
	return performMutation(mu, blankNodeLabel);
}

async function performNquadMutation(
	nquads: string,
	blankNodeLabel: string,
): Promise<string> {
	const mu = new dgraph.Mutation();
	mu.setSetNquads(nquads);
	return performMutation(mu, blankNodeLabel);
}

async function performNquadDeletion(
	nquads: string,
	blankNodeLabel: string,
): Promise<string> {
	const mu = new dgraph.Mutation();
	mu.setDelNquads(nquads);
	return performMutation(mu, blankNodeLabel);
}

async function checkIntegrity(
	updatedProfile: object,
	query: string,
	vars?: object,
) {
	const res = await client.newTxn().queryWithVars(query, vars);
	const receivedObject = res.getJson().all[0];
	expect(receivedObject).toEqual(updatedProfile);
}

async function upsertDeletionWithVars(): Promise<void> {
	const jsonObj = {
		uid: "_:prashant",
		name: "Prashant",
		"dgraph.type": "Person",
	};
	await performJsonMutation(jsonObj, "prashant");
	const expectedObj = {
		name: "Prashant",
	};
	const query = `{
        all(func: has(name)) {
            name
        }
    }`;
	await checkIntegrity(expectedObj, query);
	const deleteJsonObj = {
		uid: "uid(user)",
	};
	const query2 = `query all($userName: string) {
        user as all(func: eq(name, $userName))
    }`;
	const vars = {
		$userName: "Prashant",
	};
	const mu = new dgraph.Mutation();
	mu.setDeleteJson(deleteJsonObj);
	await performUpsert(mu, query2, vars);
	await checkIntegrity(undefined, query);
}

describe("delete", () => {
	it("should delete node", async () => {
		client = await setup();

		const nquads = '_:alice <name> "Alice" .';
		const uid = await performNquadMutation(nquads, "alice");

		const q = `{
            all(func: uid(${uid})) {
                name
            }
        }`;
		const expectedJson = {
			name: "Alice",
		};
		await checkIntegrity(expectedJson, q);

		const nquads2 = `<${uid}> <name> * .`;
		await performNquadDeletion(nquads2, uid.toString());

		const res = await client.newTxn().query(q);
		expect(res.getJson().all).toHaveLength(0);
	});

	it("should delete edges", async () => {
		client = await setup();
		await setSchema(client, "age: int .\nmarried: bool .");

		const jsonObj = {
			uid: "_:alice",
			name: "Alice",
			age: 26,
			loc: "Riley Street",
			married: true,
			schools: [
				{
					name: "Crown Public School",
				},
			],
			friends: [
				{
					name: "Bob",
					age: 24,
				},
				{
					name: "Charlie",
					age: 29,
				},
			],
		};
		const uid = await performJsonMutation(jsonObj, "alice");

		const expectedJson = jsonObj;
		delete expectedJson["uid"];
		const query = `{
            all(func: uid(${uid})) {
                name
                age
                loc
                married
                schools {
                    name
                }
                friends (orderasc: name) {
                    name
                    age
                }
            }
        }`;
		await checkIntegrity(expectedJson, query);

		const mu = new dgraph.Mutation();
		dgraph.deleteEdges(mu, uid, "friends");
		mu.setCommitNow(true);
		await client.newTxn().mutate(mu);

		const res = await client.newTxn().query(query);
		expect(res.getJson().all[0].friends).toBeFalsy();
	});

	it("should delete a node with upsert using graphql", async () => {
		client = await setup();
		await setSchema(
			client,
			`
            name: string @index(hash) .

            type Person {
                name: string
            }
        `,
		);
		await upsertDeletionWithVars();
	});
});
