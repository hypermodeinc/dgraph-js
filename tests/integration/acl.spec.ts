/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { fail } from 'assert'
import { exec } from 'child_process'
import { promisify } from 'util'

import * as dgraph from '../../src'
import {
  SERVER_ADDR,
  createClient,
  createClientStub,
  setSchema,
  setup,
  wait,
} from '../helper'

const JEST_TIMEOUT = 60 * 1000 // 1 minute in milliseconds
const WAIT_FOR_SIX_SECONDS = 6 * 1000 // 6 seconds in milliseconds

jest.setTimeout(JEST_TIMEOUT)

let client: dgraph.DgraphClient

const GUARDIAN_CREDS = 'user=groot;password=password;namespace=0'
const USERID = 'alice'
const USERPWD = 'alicepassword'
const PRED = 'name'
const DEV_GROUP = 'dev'

const execute = promisify(exec)

const MUTATE_PERMISSION_DENIED = new Error(`7 PERMISSION_DENIED:\
 unauthorized to mutate following predicates: ${PRED} \n`)
const ALTER_PERMISSION_DENIED = new Error(`7 PERMISSION_DENIED:\
 unauthorized to alter following predicates: ${PRED} \n`)

async function cmd(command: string) {
  try {
    await execute(command)
  } catch (err) {
    fail(`Failed to execute command:\n\t${command}\nError: ${err}`)
  }
}

async function insertSampleData() {
  const txn = client.newTxn()
  const mu = new dgraph.Mutation()
  mu.setSetNquads(`
        _:prashant <${PRED}> "Prashant" .
    `)
  mu.setCommitNow(true)
  const res = await txn.mutate(mu)
  const uid = res.getUidsMap().get('prashant')
  expect(uid).toBeDefined()
}

async function loginUser(): Promise<dgraph.DgraphClient> {
  const aclClientStub = createClientStub()
  try {
    await aclClientStub.login(USERID, USERPWD)
  } catch (e) {
    fail(`Login error: \tUSERID - ${USERID} \tUSERPWD - ${USERPWD}\n${e}`)
  }
  return createClient(aclClientStub)
}

async function aclSetup() {
  client = await setup()
  await setSchema(
    client,
    `
        ${PRED}: string .
    `,
  )
  await insertSampleData()
  await addUser()
  await addGroup()
  await addUserToGroup()
  return loginUser()
}

async function addUser() {
  const command = `dgraph acl -a '${SERVER_ADDR}' add -u '${USERID}' -p '${USERPWD}' --guardian-creds '${GUARDIAN_CREDS}'`
  await cmd(command)
}

async function addGroup() {
  const command = `dgraph acl -a '${SERVER_ADDR}' add -g '${DEV_GROUP}' --guardian-creds '${GUARDIAN_CREDS}'`
  await cmd(command)
}

async function addUserToGroup() {
  const command = `dgraph acl -a '${SERVER_ADDR}' mod -u '${USERID}' -l '${DEV_GROUP}' --guardian-creds '${GUARDIAN_CREDS}'`
  await cmd(command)
}

async function changePermission(permission: number) {
  const command = `dgraph acl -a '${SERVER_ADDR}' mod -g '${DEV_GROUP}' -p '${PRED}' -m '${permission}' --guardian-creds '${GUARDIAN_CREDS}'`
  await cmd(command)
  await wait(WAIT_FOR_SIX_SECONDS)
}

async function tryReading(aclClient: dgraph.DgraphClient): Promise<boolean> {
  const txn = aclClient.newTxn()
  const res: dgraph.Response = await txn.query(`{
        me(func: has(${PRED})) {
            ${PRED}
        }
    }`)
  const data = res.getJson()
  if (data.me === undefined) {
    expect(data).toEqual({})
    return false
  } else {
    expect(data.me).not.toHaveLength(0)
    return true
  }
}

async function tryWriting(aclClient: dgraph.DgraphClient): Promise<boolean> {
  const txn = aclClient.newTxn()
  try {
    const mu = new dgraph.Mutation()
    mu.setSetNquads(`
            _:ashish <${PRED}> "Ashish" .
        `)
    mu.setCommitNow(true)
    const res = await txn.mutate(mu)
    const uid = res.getUidsMap().get('ashish')
    expect(uid).toBeDefined()
    return true
  } catch (e) {
    expect(e).toEqual(MUTATE_PERMISSION_DENIED)
    return false
  }
}

async function tryAltering(aclClient: dgraph.DgraphClient): Promise<boolean> {
  try {
    const operation = new dgraph.Operation()
    operation.setSchema(`
            ${PRED}: string @index(exact, term) .
        `)
    await aclClient.alter(operation)
    return true
  } catch (e) {
    expect(e).toEqual(ALTER_PERMISSION_DENIED)
    return false
  }
}

describe('ACL tests', () => {
  it('has no access', async () => {
    const aclClient = await aclSetup()
    await changePermission(0)
    await expect(tryReading(aclClient)).resolves.toBe(false)
    await expect(tryWriting(aclClient)).resolves.toBe(false)
    await expect(tryAltering(aclClient)).resolves.toBe(false)
  })

  it('only has read access', async () => {
    const aclClient = await aclSetup()
    await changePermission(4)
    await expect(tryReading(aclClient)).resolves.toBe(true)
    await expect(tryWriting(aclClient)).resolves.toBe(false)
    await expect(tryAltering(aclClient)).resolves.toBe(false)
  })

  it('only has write access', async () => {
    const aclClient = await aclSetup()
    await changePermission(2)
    await expect(tryReading(aclClient)).resolves.toBe(false)
    await expect(tryWriting(aclClient)).resolves.toBe(true)
    await expect(tryAltering(aclClient)).resolves.toBe(false)
  })

  it('only has modify access', async () => {
    const aclClient = await aclSetup()
    await changePermission(1)
    await expect(tryReading(aclClient)).resolves.toBe(false)
    await expect(tryWriting(aclClient)).resolves.toBe(false)
    await expect(tryAltering(aclClient)).resolves.toBe(true)
  })
})
