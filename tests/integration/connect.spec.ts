/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dgraph from "../../src"

import { SERVER_ADDR } from "../helper"

describe("open function", () => {
  it("should connect with authentication and execute a query", async () => {
    const url = `dgraph://groot:password@${SERVER_ADDR}`
    const client = await dgraph.Open(url)
    const query = `
      {
        me(func: uid(1)) {
          uid
        }
      }
    `
    const txn = client.newTxn({ readOnly: true })
    const response = await txn.query(query)

    // Assertions
    expect(response).not.toBeNull()
    const parsedJson = response.getJson() // No need for JSON.parse
    expect(parsedJson.me[0].uid).toBe("0x1")
  })

  it("should throw an error for invalid scheme", async () => {
    const invalidUrl = `http://${SERVER_ADDR}`
    await expect(async () => dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Invalid scheme: must start with dgraph://",
    )
  })

  it("should throw an error for missing hostname", async () => {
    const invalidUrl = `dgraph://:${SERVER_ADDR.split(":")[1]}`
    await expect(async () => dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Invalid connection string: hostname required",
    )
  })

  it("should throw an error for missing port", async () => {
    const invalidUrl = `dgraph://${SERVER_ADDR.split(":")[0]}`
    await expect(async () => await dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Invalid connection string: port required",
    )
  })

  it("should throw an error for username without password", async () => {
    const invalidUrl = `dgraph://groot@${SERVER_ADDR}`
    await expect(async () => await dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Invalid connection string: password required when username is provided",
    )
  })

  it("should throw an error for unsupported sslmode", async () => {
    const invalidUrl = `dgraph://${SERVER_ADDR}?sslmode=invalidsllmode`
    await expect(async () => await dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Invalid SSL mode: invalidsllmode (must be one of disable, require, verify-ca)",
    )
  })

  it("should fail login with invalid credentials", async () => {
    const invalidUrl = `dgraph://groot:wrongpassword@${SERVER_ADDR}`
    await expect(async () => await dgraph.Open(invalidUrl)).rejects.toThrowError(
      "Failed to sign in user:",
    )
  })
})
