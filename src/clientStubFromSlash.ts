/*
 * SPDX-FileCopyrightText: © Hypermode Inc. <hello@hypermode.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from "@grpc/grpc-js";
import * as Url from "url-parse";
import { DgraphClientStub } from "./clientStub";

const PORT = "443";
/**
 * @deprecated since v21.3 and will be removed in v21.07 release.
 *     Please use {@link clientStubFromCloudEndpoint} instead.
 */

export function clientStubFromSlashGraphQLEndpoint(
	graphqlEndpoint: string,
	apiKey: string,
) {
	return clientStubFromCloudEndpoint(graphqlEndpoint, apiKey);
}

/**
 * @deprecated
 *     Please use {@link Open} instead.
 */
export function clientStubFromCloudEndpoint(
	graphqlEndpoint: string,
	apiKey: string,
) {
	const url = new Url(graphqlEndpoint);
	const urlParts = url.host.split(".");
	const firstHalf = urlParts[0];
	const secondHalf = `${urlParts.splice(1).join(".")}:${PORT}`;
	const backenedURL = `${firstHalf}.grpc.${secondHalf}`;

	const metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_: object, callback: (_: undefined, metadata: grpc.Metadata) => void) => {
			const metadata = new grpc.Metadata();
			metadata.add("authorization", apiKey);
			callback(undefined, metadata);
		},
	);
	const credentials = grpc.credentials.combineChannelCredentials(
		grpc.credentials.createSsl(),
		metaCreds,
	);
	return new DgraphClientStub(backenedURL, credentials);
}
