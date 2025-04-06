/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as jspb from "google-protobuf";

import * as messages from "../generated/api_pb";

import {
	b64ToStr,
	isBase64,
	strToB64,
	strToJson,
	strToU8,
	u8ToStr,
} from "./util";

// Alter classes.

/**
 * Payload represents the return value of an alter operation.
 */
export class Payload extends messages.Payload {
	public getData(): any {
		let jsonStr: string;
		const value = super.getData();
		if (value instanceof Uint8Array) {
			jsonStr = u8ToStr(value);
		} else {
			jsonStr = b64ToStr(value);
		}

		return strToJson(jsonStr);
	}

	public getData_asB64(): string {
		const value = super.getData();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getData_asU8(): Uint8Array {
		const value = super.getData();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setData(value: any): void {
		if (value instanceof Uint8Array) {
			super.setData(value);
			return;
		}
		if (typeof value === "string" || value instanceof String) {
			super.setData(value.toString());
			return;
		}

		const jsonStr = JSON.stringify(value);
		super.setData(strToU8(jsonStr));
	}
}

export function createPayload(oldPayload: messages.Payload): Payload {
	return messages.Payload.deserializeBinaryFromReader(
		new Payload(),
		new jspb.BinaryReader(oldPayload.serializeBinary()),
	);
}

// Mutation and Query classes.

/**
 * Response represents the return value of a mutation or query operations.
 */
export class Response extends messages.Response {
	public getJson(): any {
		let jsonStr: string;
		const value = super.getJson();
		if (value instanceof Uint8Array) {
			jsonStr = u8ToStr(value);
		} else {
			jsonStr = b64ToStr(value);
		}

		return strToJson(jsonStr);
	}

	public getJson_asB64(): string {
		const value = super.getJson();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getJson_asU8(): Uint8Array {
		const value = super.getJson();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setJson(value: any): void {
		if (value instanceof Uint8Array) {
			super.setJson(value);
			return;
		}
		if (typeof value === "string" || value instanceof String) {
			super.setJson(value.toString());
			return;
		}

		const jsonStr = JSON.stringify(value);
		super.setJson(strToU8(jsonStr));
	}
}

export function createResponse(oldResponse: messages.Response): Response {
	return messages.Response.deserializeBinaryFromReader(
		new Response(),
		new jspb.BinaryReader(oldResponse.serializeBinary()),
	);
}

// Mutate classes.

/**
 * Mutation represents the request value of a muatate operation.
 */
export class Mutation extends messages.Mutation {
	public getSetJson(): any {
		let jsonStr: string;
		const value = super.getSetJson();
		if (value instanceof Uint8Array) {
			jsonStr = u8ToStr(value);
		} else {
			jsonStr = b64ToStr(value);
		}

		return strToJson(jsonStr);
	}

	public getSetJson_asB64(): string {
		const value = super.getSetJson();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getSetJson_asU8(): Uint8Array {
		const value = super.getSetJson();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setSetJson(value: any): void {
		if (value instanceof Uint8Array) {
			super.setSetJson(value);
			return;
		}
		if (typeof value === "string" || value instanceof String) {
			super.setSetJson(value.toString());
			return;
		}

		const jsonStr = JSON.stringify(value);
		super.setSetJson(strToU8(jsonStr));
	}

	public getDeleteJson(): any {
		let jsonStr: string;
		const value = super.getDeleteJson();
		if (value instanceof Uint8Array) {
			jsonStr = u8ToStr(value);
		} else {
			jsonStr = b64ToStr(value);
		}

		return strToJson(jsonStr);
	}

	public getDeleteJson_asB64(): string {
		const value = super.getDeleteJson();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getDeleteJson_asU8(): Uint8Array {
		const value = super.getDeleteJson();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setDeleteJson(value: any): void {
		if (value instanceof Uint8Array) {
			super.setDeleteJson(value);
			return;
		}
		if (typeof value === "string" || value instanceof String) {
			super.setDeleteJson(value.toString());
			return;
		}

		const jsonStr = JSON.stringify(value);
		super.setDeleteJson(strToU8(jsonStr));
	}

	public getSetNquads(): Uint8Array | string {
		const value = super.getSetNquads();
		if (value instanceof Uint8Array) {
			return u8ToStr(value);
		}

		return b64ToStr(value);
	}

	public getSetNquads_asB64(): string {
		const value = super.getSetNquads();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getSetNquads_asU8(): Uint8Array {
		const value = super.getSetNquads();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setSetNquads(value: Uint8Array | string): void {
		if (value instanceof Uint8Array) {
			super.setSetNquads(value);
			return;
		}
		if (isBase64(value)) {
			super.setSetNquads(value);
			return;
		}

		super.setSetNquads(strToB64(value));
	}

	public getDelNquads(): Uint8Array | string {
		const value = super.getDelNquads();
		if (value instanceof Uint8Array) {
			return u8ToStr(value);
		}

		return b64ToStr(value);
	}

	public getDelNquads_asB64(): string {
		const value = super.getDelNquads();
		if (value instanceof Uint8Array) {
			return jspb.Message.bytesAsB64(value);
		}

		return value;
	}

	public getDelNquads_asU8(): Uint8Array {
		const value = super.getDelNquads();
		if (typeof value === "string" || value instanceof String) {
			return jspb.Message.bytesAsU8(value.toString());
		}

		return value;
	}

	public setDelNquads(value: Uint8Array | string): void {
		if (value instanceof Uint8Array) {
			super.setDelNquads(value);
			return;
		}
		if (isBase64(value)) {
			super.setDelNquads(value);
			return;
		}

		super.setDelNquads(strToB64(value));
	}
}
