/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from "@grpc/grpc-js";

// Non-exported functions.
import {
	isAbortedError,
	isBase64,
	isConflictError,
	promisify1,
	promisify3,
} from "../src/util";

function fnAddThisVal1(
	a: number,
	cb: (err?: Error, res?: number) => void,
): void {
	cb(undefined, (<{ val: number }>this).val + a);
}

function fnAddThisVal3(
	a: number,
	b: number,
	c: number,
	cb: (err?: Error, res?: number) => void,
): void {
	cb(undefined, (<{ val: number }>this).val + a + b + c);
}

describe("util", () => {
	describe("promisify1", () => {
		it("should handle valid response in callback", async () => {
			const f = (_: number, cb: (err?: Error, res?: number) => void) => {
				cb(undefined, 2);
			};

			await expect(promisify1(f, undefined)(1)).resolves.toBe(2);
		});

		it("should handle error in callback", async () => {
			const e = new Error();
			const f = (_: number, cb: (err?: Error, res?: number) => void) => {
				cb(e);
			};

			await expect(promisify1(f, undefined)(1)).rejects.toBe(e);
		});

		it("should handle error if valid response is also present in callback", async () => {
			const e = new Error();
			const f = (_: number, cb: (err?: Error, res?: number) => void) => {
				cb(e, 2);
			};

			await expect(promisify1(f, undefined)(1)).rejects.toBe(e);
		});

		it("should handle callback called without arguments", async () => {
			const f = (_: number, cb: (err?: Error, res?: number) => void) => {
				cb();
			};

			await expect(promisify1(f, undefined)(1)).resolves.toBeUndefined();
		});

		it("should handle thisContext argument", async () => {
			const o = {
				val: 45,
			};

			await expect(promisify1(fnAddThisVal1, o)(5)).resolves.toEqual(50);
		});
	});

	describe("promisify3", () => {
		it("should handle valid response in callback", async () => {
			const f = (
				_A: number,
				b: number,
				_C: number,
				cb: (err?: Error, res?: number) => void,
			) => {
				cb(undefined, b);
			};

			await expect(promisify3(f, undefined)(1, 2, 3)).resolves.toBe(2);
			await expect(promisify3(f, undefined)(1, 22, 3)).resolves.toBe(22);
		});

		it("should handle error in callback", async () => {
			const e = new Error();
			const f = (
				_A: number,
				_B: number,
				_C: number,
				cb: (err?: Error, res?: number) => void,
			) => {
				cb(e);
			};

			await expect(promisify3(f, undefined)(1, 2, 3)).rejects.toBe(e);
		});

		it("should handle error if valid response is also present in callback", async () => {
			const e = new Error();
			const f = (
				_A: number,
				b: number,
				_C: number,
				cb: (err?: Error, res?: number) => void,
			) => {
				cb(e, b);
			};

			await expect(promisify3(f, undefined)(1, 2, 3)).rejects.toBe(e);
		});

		it("should handle callback called without arguments", async () => {
			const f = (
				_A: number,
				_B: number,
				_C: number,
				cb: (err?: Error, res?: number) => void,
			) => {
				cb();
			};

			await expect(promisify3(f, undefined)(1, 2, 3)).resolves.toBeUndefined();
		});

		it("should handle thisContext argument", async () => {
			const o = {
				val: 45,
			};

			await expect(promisify3(fnAddThisVal3, o)(5, 10, 15)).resolves.toEqual(
				75,
			);
		});
	});

	describe("isAbortedError", () => {
		it("should return false for undefined and null", () => {
			expect(isAbortedError(undefined)).toBe(false);
		});

		it("should return false for objects not having code property", () => {
			expect(isAbortedError(() => true)).toBe(false);
			expect(isAbortedError([1, 2, 3])).toBe(false);
			expect(isAbortedError({ a: 1, b: "b" })).toBe(false);
		});

		it("should return true for objects correct having correct code value", () => {
			expect(isAbortedError({ code: grpc.status.ABORTED })).toBe(true);
			expect(isAbortedError({ code: grpc.status.FAILED_PRECONDITION })).toBe(
				false,
			);
			expect(isAbortedError({ code: grpc.status.OK })).toBe(false);
		});
	});

	describe("isConflictError", () => {
		it("should return false for undefined", () => {
			expect(isConflictError(undefined)).toBe(false);
		});

		it("should return false for objects not having code property", () => {
			expect(isConflictError(() => true)).toBe(false);
			expect(isConflictError([1, 2, 3])).toBe(false);
			expect(isConflictError({ a: 1, b: "b" })).toBe(false);
		});

		it("should return true for objects correct having correct code value", () => {
			expect(isConflictError({ code: grpc.status.ABORTED })).toBe(true);
			expect(isConflictError({ code: grpc.status.FAILED_PRECONDITION })).toBe(
				true,
			);
			expect(isConflictError({ code: grpc.status.OK })).toBe(false);
		});
	});

	describe("isBase64", () => {
		it("should return true for valid base64 strings", () => {
			expect(isBase64("")).toBe(true);
			expect(isBase64("yz==")).toBe(true);
			expect(isBase64("uwAxyz==")).toBe(true);
			expect(isBase64("uwAxyzp=")).toBe(true);
			expect(isBase64("uwAxyzp5")).toBe(true);
		});

		it("should return false for invalid base64 strings", () => {
			expect(isBase64("a")).toBe(false);
			expect(isBase64("abcdef")).toBe(false);
			expect(isBase64("sad$")).toBe(false);
			expect(isBase64("dddddd=")).toBe(false);
		});
	});
});
