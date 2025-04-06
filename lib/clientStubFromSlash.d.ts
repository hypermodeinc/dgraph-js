/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DgraphClientStub } from './clientStub'
export declare function clientStubFromSlashGraphQLEndpoint(
  graphqlEndpoint: string,
  apiKey: string,
): DgraphClientStub
export declare function clientStubFromCloudEndpoint(
  graphqlEndpoint: string,
  apiKey: string,
): DgraphClientStub
