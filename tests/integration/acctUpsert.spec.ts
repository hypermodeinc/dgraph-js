/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src";

import { setSchema, setup } from "../helper";

const concurrency = 3;
const timeout = 5 * 60 * 1000; // 5 minutes in milliseconds

jest.setTimeout(timeout * 2);

let client: dgraph.DgraphClient;

const firsts = ["Paul", "Eric", "Jack", "John", "Martin"];
const lasts = ["Brown", "Smith", "Robinson", "Waters", "Taylor"];
const ages = [20, 25, 30, 35];

type Account = {
	first: string;
	last: string;
	age: number;
};
const accounts: Account[] = [];

firsts.forEach((first: string): void =>
	lasts.forEach((last: string): void =>
		ages.forEach((age: number): void => {
			accounts.push({
				first,
				last,
				age,
			});
		}),
	),
);

async function tryUpsert(account: Account): Promise<void> {
	const txn = client.newTxn();

	const q = `{
        find(func: eq(first, "${account.first}")) @filter(eq(last, "${account.last}") AND eq(age, "${account.age}")) {
            uid: _uid_
        }
    }`;

	try {
		const res = await txn.query(q);
		const resJson: {
			find: { uid: string }[];
		} = res.getJson();
		expect(resJson.find.length).toBeLessThanOrEqual(1);

		let mu: dgraph.Mutation;
		let uid: string;
		if (resJson.find.length === 1) {
			uid = resJson.find[0].uid;
		} else {
			mu = new dgraph.Mutation();
			mu.setSetNquads(`
                _:acct <first> "${account.first}" .
                _:acct <last>  "${account.last}" .
                _:acct <age>   "${account.age}"^^<xs:int> .
            `);

			const ag = await txn.mutate(mu);
			uid = ag.getUidsMap().get("acct");
			expect(uid).not.toEqual("");
		}

		mu = new dgraph.Mutation();
		// Time used here is in milliseconds.
		mu.setSetNquads(`<${uid}> <when> "${new Date().getTime()}"^^<xs:int> .`);
		await txn.mutate(mu);

		await txn.commit();
	} finally {
		await txn.discard();
	}
}

let startStatus = 0; // set at the start of doUpserts
let lastStatus = 0;
let cancelled = false; // cancelled due to timeout

let successCount = 0;
let retryCount = 0;

function conditionalLog(): void {
	const now = new Date().getTime();
	if (now - lastStatus > 1000 && !cancelled) {
		console.log(
			`Success: ${successCount}, Retries: ${retryCount}, Total Time: ${now - startStatus} ms`,
		);
		lastStatus = now;
	}
}

async function upsert(account: Account): Promise<void> {
	let done = false;
	while (!done && !cancelled) {
		try {
			await tryUpsert(account);
			successCount += 1;
			done = true;
		} catch (e) {
			expect(e).toBe(dgraph.ERR_ABORTED);
			retryCount += 1;
		}

		conditionalLog();
	}

	if (!done) {
		throw new Error(`Timeout elapsed: ${timeout / 1000}s`);
	}
}

async function doUpserts(): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const account of accounts) {
		for (let i = 0; i < concurrency; i += 1) {
			promises.push(upsert(account));
		}
	}

	startStatus = new Date().getTime();
	const id = setTimeout(() => {
		cancelled = true;
	}, timeout);

	await Promise.all(promises).then(() => {
		clearTimeout(id);
	});
}

async function checkIntegrity(): Promise<void> {
	const res = await client.newTxn().query(`{
        all(func: anyofterms(first, "${firsts.join(" ")}")) {
            first
            last
            age
        }
    }`);

	const data: {
		all: Account[];
	} = res.getJson();

	const accountSet: { [key: string]: boolean } = {};
	for (const account of data.all) {
		expect(account.first).toBeTruthy();
		expect(account.last).toBeTruthy();
		expect(account.age).toBeTruthy();
		accountSet[`${account.first}_${account.last}_${account.age}`] = true;
	}

	for (const account of accounts) {
		expect(accountSet[`${account.first}_${account.last}_${account.age}`]).toBe(
			true,
		);
	}
}

describe("acctUpsert", () => {
	it("should successfully perform upsert load test", async () => {
		client = await setup();
		await setSchema(
			client,
			`
            first:  string   @index(term) .
            last:   string   @index(hash) .
            age:    int      @index(int)  .
            when:   int                   .
        `,
		);

		await doUpserts();
		await checkIntegrity();
	});
});
