/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import type * as jspb from "google-protobuf";
export declare function errorCode(err: any): {
	valid: boolean;
	code: number;
};
export declare function isAbortedError(err: any): boolean;
export declare function isConflictError(err: any): boolean;
export declare function isUnauthenticatedError(err: any): boolean;
export declare function promisify1<A, T>(
	f: (arg: A, cb: (err?: Error, res?: T) => void) => void,
	thisContext?: any,
): (arg: A) => Promise<T>;
export declare function promisify3<A, B, C, T>(
	f: (argA: A, argB: B, argC: C, cb: (err?: Error, res?: T) => void) => void,
	thisContext?: any,
): (argA: A, argB: B, argC: C) => Promise<T>;
export declare function stringifyMessage(msg: jspb.Message): string;
export { isBase64 } from "is-base64";
export declare function strToB64(str: string): string;
export declare function strToU8(str: string): Uint8Array;
export declare function b64ToStr(b64Str: string): string;
export declare function u8ToStr(arr: Uint8Array): string;
export declare function strToJson(jsonStr: string): any;
