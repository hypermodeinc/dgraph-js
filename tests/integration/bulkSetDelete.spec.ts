/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src";

import { setSchema, setup } from "../helper";

let client: dgraph.DgraphClient;

type Profile = {
	name: string;
	email: string;
	age: number;
};
const profiles: Profile[] = [
	{ name: "Aman", email: "aman@dgraph.io", age: 26 },
	{ name: "Animesh", email: "animesh@dgraph.io", age: 24 },
	{ name: "Ashish", email: "ashish@dgraph.io", age: 26 },
	{ name: "Prashant", email: "prashant@dgraph.io", age: 23 },
];
const names: string[] = [];
profiles.forEach((profile: Profile): void => {
	names.push(profile.name);
});

function getMutationNquads() {
	let mutationNquads = "";
	profiles.forEach((profile: Profile) => {
		const blankNodeLabel = `_:${profile.name.toLocaleLowerCase()}`;
		mutationNquads += `
            ${blankNodeLabel} <name> "${profile.name}" .
            ${blankNodeLabel} <email>  "${profile.email}" .
            ${blankNodeLabel} <age>   "${profile.age}"^^<xs:int> .
        `;
	});
	return mutationNquads;
}

async function doBulkSet() {
	const txn = client.newTxn();
	const mu = new dgraph.Mutation();
	mu.setSetNquads(getMutationNquads());

	const req = new dgraph.Request();
	req.addMutations(mu);
	req.setCommitNow(true);

	await txn.doRequest(req);

	const res = await readProfiles();
	expect(res).toEqual({ all: profiles });
}

async function readProfiles() {
	const query = `query {
        all(func: anyofterms(name, "${names.join(", ")}"), orderasc: name) {
            name
            email
            age
        }
    }`;
	const req = new dgraph.Request();
	req.setQuery(query);
	const res = await client.newTxn().doRequest(req);

	return res.getJson();
}

async function doBulkDelete() {
	const txn = client.newTxn();
	const query = `query {
        a as var(func: eq(name, "Prashant"))
    }`;
	const mu = new dgraph.Mutation();
	mu.setDelNquads(`
        uid(a) <name> * .
        uid(a) <email> * .
        uid(a) <age> * .
    `);

	const req = new dgraph.Request();
	req.addMutations(mu);
	req.setQuery(query);
	req.setCommitNow(true);

	await txn.doRequest(req);

	const res = await readProfiles();
	const tempProfiles = profiles;
	tempProfiles.pop();
	expect(res).toEqual({ all: tempProfiles });
}

describe("Bulk operations using doRequest", () => {
	it("successfully perform bulk set", async () => {
		client = await setup();
		await setSchema(
			client,
			`
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
		);

		await doBulkSet();
	});

	it("successfully perform bulk delete", async () => {
		client = await setup();
		await setSchema(
			client,
			`
            name:   string   @index(term) .
            email:  string   @index(exact) .
            age:    int   @index(int) .
        `,
		);

		await doBulkSet();
		await doBulkDelete();
	});
});
