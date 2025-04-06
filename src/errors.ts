/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

export const ERR_NO_CLIENTS = new Error(
  'No clients provided in DgraphClient constructor',
)
export const ERR_FINISHED = new Error(
  'Transaction has already been committed or discarded',
)
export const ERR_ABORTED = new Error(
  'Transaction has been aborted. Please retry',
)
export const ERR_BEST_EFFORT_REQUIRED_READ_ONLY = new Error(
  'Best effort only works for read-only queries',
)
export const ERR_READ_ONLY = new Error(
  'Readonly transaction cannot run mutations or be committed',
)
export const ERR_REFRESH_JWT_EMPTY = new Error(
  'refresh jwt should not be empty',
)
