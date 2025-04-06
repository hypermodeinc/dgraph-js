/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from "crypto";
import * as dgraph from "../../src";
import { setSchema, setup, wait } from "../helper";

const concurrency = 5;
const totalAccounts = 100;
const totalTxns = 1000;
const initialBalance = 100;
const timeout = 5 * 60 * 1000; // 5 minutes in milliseconds

jest.setTimeout(timeout * 2);

let client: dgraph.DgraphClient;

type Account = {
	bal: number;
};

const uids: string[] = [];

async function createAccounts(): Promise<void> {
	await setSchema(client, "bal: int .");

	const accounts: Account[] = [];
	for (let i = 0; i < totalAccounts; i += 1) {
		accounts.push({
			bal: initialBalance,
		});
	}

	const txn = client.newTxn();
	const mu = new dgraph.Mutation();
	mu.setSetJson(accounts);
	const ag = await txn.mutate(mu);
	await txn.commit();

	ag.getUidsMap().forEach((value: string): void => {
		uids.push(value);
	});
}

let startStatus = 0; // set before Promise.all
let cancelled = false;
let finished = false;

let runs = 0;
let aborts = 0;

async function runTotal(): Promise<void> {
	const res = await client.newTxn().query(`{
        var(func: uid(${uids.join(",")})) {
            b as bal
        }
        total() {
            bal: sum(val(b))
        }
      }`);
	expect(res.getJson().total[0].bal).toBe(uids.length * initialBalance);

	console.log(
		`Runs: ${runs}, Aborts: ${aborts}, Total Time: ${new Date().getTime() - startStatus} ms`,
	);
}

async function runTotalInLoop(): Promise<void> {
	while (!finished && !cancelled) {
		try {
			await runTotal();
			await wait(1000);
		} catch (e) {
			finished = true;
			throw e;
		}
	}
}

async function runTxn(): Promise<void> {
	let fromUid: string;
	let toUid: string;

	while (true) {
		fromUid = uids[crypto.randomInt(uids.length)];
		toUid = uids[crypto.randomInt(uids.length)];

		if (fromUid !== toUid) {
			break;
		}
	}

	const txn = client.newTxn();
	try {
		const res = await txn.query(
			`{both(func: uid(${fromUid}, ${toUid})) { uid, bal }}`,
		);
		const accountsWithUid: {
			uid: string;
			bal: number;
		}[] = res.getJson().both;
		expect(accountsWithUid).toHaveLength(2);

		accountsWithUid[0].bal += 5;
		accountsWithUid[1].bal -= 5;

		const mu = new dgraph.Mutation();
		mu.setSetJson(accountsWithUid);
		await txn.mutate(mu);
		await txn.commit();
	} finally {
		await txn.discard();
	}
}

async function runTxnInLoop(): Promise<void> {
	while (!finished && !cancelled) {
		try {
			await runTxn();
			runs += 1;
			if (runs > totalTxns) {
				finished = true;
				return;
			}
		} catch {
			aborts += 1;
		}
	}

	if (!finished) {
		throw new Error(`Timeout elapsed: ${timeout / 1000}s`);
	}
}

describe("bank", () => {
	it("should successfully perform transaction load test", async () => {
		client = await setup();
		await createAccounts();

		const promises = [runTotalInLoop()];
		for (let i = 0; i < concurrency; i += 1) {
			promises.push(runTxnInLoop());
		}

		startStatus = new Date().getTime();
		const id = setTimeout(() => {
			cancelled = true;
		}, timeout);

		await Promise.all(promises);

		if (!cancelled) {
			clearTimeout(id);
		}
	});
});
