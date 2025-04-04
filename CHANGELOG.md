# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.1.0/), and this project
adheres to [Calendar Versioning](https://calver.org/) starting v20.03.0.

## [24.2.0] - 2025-04-04

**Added**

- Support for Dgraph connection strings: Introduced the ability to connect using Dgraph connection
  strings. This enhancement simplifies the configuration process for establishing connections.
  (#263)

**Removed**

- Removed ESLint from the project. (#264)

**Changed**

- Updated Node.js to version 22. (#262)​
- Updated @grpc/grpc-js to version 1.12.6. (#260)​
- Performed minor and patch updates for development dependencies. (#261 #258 #256 #255 #244 #245
  #246 #247 #248 #249 #238 #240)

## [24.1.0] - 2024-11-13

**Changed**

- Bump the minor-and-patch group with 4 updates (#234 #232 #230 #229 #227 #228 #234 #226 #223 #225
  #222 #221 #220 #218 #217)
- Remove `grpc` dependency (#233)
- fix euclidean spelling (#224)
- update examples (#219)

## [24.0.0] - 2024-08-22

**Added**

- feat: Add Vector Support. ([#214])

**Security**

Version bump.

## [21.03.1] - 2021-05-19

**Added**

- fix(deprecation): add clientStubFromCloudEndpoint method ([#138])

[#138]: https://github.com/hypermodeinc/dgraph-js/pull/138

## [v21.03.0] - 2021-04-08

**Added**

- LoginIntoNamespace API

**Removed**

- Nquad does not have `label`

The `clientStubFromSlashGraphQLEndpoint` API is deprecated and will be removed in the next release.

## [v20.11] - 2021-03-16

**Added**

- Add support for RDF response ([#129])

**Changed**

- Bumped gRPC libs

## [v20.03.1] - 2020-10-04

**Added**

- Extend support to connect to dgraph client via Slash endpoints and apiKey ([#125])

**Changed**

- Migrate from `grpc` npm module to `grpc-js` in lieu of the deprecation of the former.

## [v20.03.0] - 2020-04-01

**Changed**

- Synced proto files to latest version to support background indexing ([#110][])

[#110]: https://github.com/hypermodeinc/dgraph-js/issues/110

## [v2.1.0] - 2020-01-30

**Fixed**

- Resolved JSON parse issue of Payload response. Fixes [#43][] ([#94][])
- Updating ACL tests to sync up changes with Dgraph v1.2 ([#103][])

**Added**

- Adding tests for upsert with graphql variables ([#101][])

**Changed**

- Synced proto files to the latest version ([#99][])

[#43]: https://github.com/hypermodeinc/dgraph-js/issues/43
[#94]: https://github.com/hypermodeinc/dgraph-js/issues/94
[#103]: https://github.com/hypermodeinc/dgraph-js/issues/103
[#101]: https://github.com/hypermodeinc/dgraph-js/issues/101
[#99]: https://github.com/hypermodeinc/dgraph-js/issues/99

## [v2.0.2] - 2019-10-01

**Changed**

- Upgrade google-protobuf dependency version to 3.8.0+ ([#80][])

**Fixed**

- Added logic to catch exceptions when `dgraphClient` fails to be created due to invalid gRPC
  address ([#71][])

[#80]: https://github.com/hypermodeinc/dgraph-js/issues/80
[#71]: https://github.com/hypermodeinc/dgraph-js/issues/71

## [v2.0.1] - 2019-09-10

**Fixed**

- Added function to refresh JWT token if expired ([#56][])

[#56]: https://github.com/hypermodeinc/dgraph-js/issues/56

## [v2.0.0] - 2019-09-06

**Added**

- `doRequest` function for performing upsert, or just a query or a mutation
- Support for ACL features in Dgraph v1.1 - login & jwt refresh
- `upsert` and `lang` fields to proto message type SchemaNode
- Option for server-side sequencing

**Changed**

- Return type of `Txn#mutate` function from `messages.Assigned` to `messages.Response`
- Updated protobufs to the latest version
- Upgraded all typescript dev libraries to the latest version

**Removed**

- Support for null values where appropriate (because of typescript warning)

## [v1.2.1] - 2018-03-16

**Fixed**

- Pass `metadata` and `options` arguments to `Txn#discard` in `Txn#mutate`

## [v1.2.0] - 2018-03-12

**Added**

- **[BREAKING]** Optional `metadata` parameter of type `grpc.Metadata` to the `DgraphClientStub`
  methods. `options` parameter moved to the third position to conform to the `grpc` package API.

  Methods affected - `DgraphClient#alter`, `Txn#query`, `Txn#queryWithVars`, `Txn#mutate`,
  `Txn#commit` and `Txn#discard`.

  To upgrade to this version, if using any of these methods with the `options` parameter, simply add
  a `null` argument before the `options` argument. For example, `client.alter(options)` becomes
  `client.alter(null, options)`

## [v1.1.2] - 2018-03-07

**Added**

- Full compatibility with Dgraph v1.0.4
- `latency` field to proto message type `Assigned`

## [v1.1.1] - 2018-02-13

**Added**

- Compatibility with grpc v1.9

**Fixed**

- Function `u8ToStr` which was leading to json parse errors ([#17][])

[#17]: https://github.com/hypermodeinc/dgraph-js/issues/17

## [v1.1.0] - 2018-02-06

**Added**

- Full compatibility with Dgraph v1.0.2

**Removed**

- `startTs` field from proto message type `Operation`

## [v1.0.4] - 2018-02-02

**Added**

- Optional `options` parameter of type `object` to the `DgraphClientStub` constructor
- Optional `options` parameter of type `grpc.CallOptions` to the `DgraphClientStub` methods
- Export `Txn` class

## [v1.0.3] - 2018-01-26

**Changed**

- `grpc` is now a peer dependency

## [v1.0.2] - 2018-01-24

**Added**

- Method `DgraphClientStub#close` to close the grpc client associated with `DgraphClientStub`
- Method `DgraphClientStub#grpcClient` to return the grpc client associated with `DgraphClientStub`
- Method `DgraphClientStub#waitForReady` to provide a promisified version of
  `grpc.Client#waitForReady`

## [v1.0.1] - 2018-01-20

**Added**

- Wrapper classes for certain proto classes to simplify the api and avoid repetitive
  serialization/deserialization code

## [v1.0.0] - 2017-12-20

**Added**

- Full compatibility with Dgraph v1.0.0

[v20.03.0]: https://github.com/hypermodeinc/dgraph-js/compare/v2.1.0...v20.03.0
[v2.1.0]: https://github.com/hypermodeinc/dgraph-js/compare/v2.0.2...v2.1.0
[v2.0.2]: https://github.com/hypermodeinc/dgraph-js/compare/v2.0.1...v2.0.2
[v2.0.1]: https://github.com/hypermodeinc/dgraph-js/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/hypermodeinc/dgraph-js/compare/v1.2.1...v2.0.0
[v1.2.1]: https://github.com/hypermodeinc/dgraph-js/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/hypermodeinc/dgraph-js/compare/v1.1.2...v1.2.0
[v1.1.2]: https://github.com/hypermodeinc/dgraph-js/compare/v1.1.1...v1.1.2
[v1.1.1]: https://github.com/hypermodeinc/dgraph-js/compare/v1.1.0...v1.1.1
[v1.1.0]: https://github.com/hypermodeinc/dgraph-js/compare/v1.0.4...v1.1.0
[v1.0.4]: https://github.com/hypermodeinc/dgraph-js/compare/v1.0.3...v1.0.4
[v1.0.3]: https://github.com/hypermodeinc/dgraph-js/compare/v1.0.2...v1.0.3
[v1.0.2]: https://github.com/hypermodeinc/dgraph-js/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/hypermodeinc/dgraph-js/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/hypermodeinc/dgraph-js/tree/v1.0.0
