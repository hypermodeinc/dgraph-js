var __awaiter =
	(this && this.__awaiter) ||
	((thisArg, _arguments, P, generator) => {
		function adopt(value) {
			return value instanceof P
				? value
				: new P((resolve) => {
						resolve(value);
					});
		}
		return new (P || (P = Promise))((resolve, reject) => {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	});
var __generator =
	(this && this.__generator) ||
	((thisArg, body) => {
		var _ = {
				label: 0,
				sent: () => {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g = Object.create(
				(typeof Iterator === "function" ? Iterator : Object).prototype,
			);
		return (
			(g.next = verb(0)),
			(g["throw"] = verb(1)),
			(g["return"] = verb(2)),
			typeof Symbol === "function" &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return (v) => step([n, v]);
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y["return"]
									: op[0]
										? y["throw"] || ((t = y["return"]) && t.call(y), 0)
										: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	});
Object.defineProperty(exports, "__esModule", { value: true });
exports.DgraphClient = void 0;
exports.isJwtExpired = isJwtExpired;
exports.deleteEdges = deleteEdges;
exports.open = open;
var grpc = require("@grpc/grpc-js");
var messages = require("../generated/api_pb");
var clientStub_1 = require("./clientStub");
var errors_1 = require("./errors");
var txn_1 = require("./txn");
var types = require("./types");
var util_1 = require("./util");
var dgraphScheme = "dgraph:";
var sslModeDisable = "disable";
var sslModeRequire = "require";
var sslModeVerifyCA = "verify-ca";
var DgraphClient = (() => {
	function DgraphClient() {
		var clients = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			clients[_i] = arguments[_i];
		}
		this.debugMode = false;
		if (clients.length === 0) {
			throw errors_1.ERR_NO_CLIENTS;
		}
		this.clients = clients;
	}
	DgraphClient.prototype.alter = function (op, metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var c, payload, operation, e_1, pl;
			var _this = this;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						this.debug(
							"Alter request:\n".concat((0, util_1.stringifyMessage)(op)),
						);
						c = this.anyClient();
						operation = () =>
							__awaiter(_this, void 0, void 0, function () {
								return __generator(this, (_a) => [
									2,
									c.alter(op, metadata, options),
								]);
							});
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 8]);
						return [4, operation()];
					case 2:
						payload = _a.sent();
						return [3, 8];
					case 3:
						e_1 = _a.sent();
						if (!(isJwtExpired(e_1) === true)) return [3, 6];
						return [4, c.retryLogin(metadata, options)];
					case 4:
						_a.sent();
						return [4, operation()];
					case 5:
						payload = _a.sent();
						return [3, 7];
					case 6:
						throw e_1;
					case 7:
						return [3, 8];
					case 8:
						pl = types.createPayload(payload);
						this.debug(
							"Alter response:\n".concat((0, util_1.stringifyMessage)(pl)),
						);
						return [2, pl];
				}
			});
		});
	};
	DgraphClient.prototype.newTxn = function (txnOpts) {
		return new txn_1.Txn(this, txnOpts);
	};
	DgraphClient.prototype.setDebugMode = function (mode) {
		if (mode === void 0) {
			mode = true;
		}
		this.debugMode = mode;
	};
	DgraphClient.prototype.debug = function (msg) {
		if (this.debugMode) {
			console.log(msg);
		}
	};
	DgraphClient.prototype.anyClient = function () {
		return this.clients[Math.floor(Math.random() * this.clients.length)];
	};
	DgraphClient.prototype.close = function () {
		this.clients.forEach((clientStub) => {
			try {
				clientStub.close();
				console.log("Closed client stub successfully");
			} catch (error) {
				console.error("Failed to close client stub:", error);
			}
		});
	};
	return DgraphClient;
})();
exports.DgraphClient = DgraphClient;
function isJwtExpired(err) {
	if (!err) {
		return false;
	}
	return (0, util_1.isUnauthenticatedError)(err);
}
function deleteEdges(mu, uid) {
	var predicates = [];
	for (var _i = 2; _i < arguments.length; _i++) {
		predicates[_i - 2] = arguments[_i];
	}
	for (var _a = 0, predicates_1 = predicates; _a < predicates_1.length; _a++) {
		var predicate = predicates_1[_a];
		var nquad = new messages.NQuad();
		nquad.setSubject(uid);
		nquad.setPredicate(predicate);
		var ov = new messages.Value();
		ov.setDefaultVal("_STAR_ALL");
		nquad.setObjectValue(ov);
		mu.addDel(nquad);
	}
}
function addApiKeyToCredentials(baseCreds, apiKey) {
	var metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_, callback) => {
			var metadata = new grpc.Metadata();
			metadata.add("authorization", apiKey);
			callback(null, metadata);
		},
	);
	return grpc.credentials.combineChannelCredentials(baseCreds, metaCreds);
}
function addBearerTokenToCredentials(baseCreds, bearerToken) {
	var metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_, callback) => {
			var metadata = new grpc.Metadata();
			metadata.add("Authorization", "Bearer ".concat(bearerToken));
			callback(null, metadata);
		},
	);
	return grpc.credentials.combineChannelCredentials(baseCreds, metaCreds);
}
function open(connStr) {
	return __awaiter(this, void 0, void 0, function () {
		var parsedUrl,
			host,
			port,
			queryParams,
			sslMode,
			credentials,
			clientStub,
			err_1;
		return __generator(this, (_a) => {
			switch (_a.label) {
				case 0:
					parsedUrl = new URL(connStr);
					if (parsedUrl.protocol !== dgraphScheme) {
						throw new Error("Invalid scheme: must start with dgraph://");
					}
					host = parsedUrl.hostname;
					port = parsedUrl.port;
					if (!host) {
						throw new Error("Invalid connection string: hostname required");
					}
					if (!port) {
						throw new Error("Invalid connection string: port required");
					}
					queryParams = {};
					if (parsedUrl.searchParams) {
						parsedUrl.searchParams.forEach((value, key) => {
							queryParams[key] = value;
						});
					}
					if (queryParams.apikey && queryParams.bearertoken) {
						throw new Error("Both apikey and bearertoken cannot be provided");
					}
					sslMode = queryParams.sslmode;
					if (sslMode === undefined) {
						sslMode = sslModeDisable;
					}
					switch (sslMode) {
						case sslModeDisable:
							credentials = grpc.credentials.createInsecure();
							break;
						case sslModeRequire:
							credentials = grpc.credentials.createSsl(null, null, null, {
								checkServerIdentity: () => undefined,
							});
							break;
						case sslModeVerifyCA:
							credentials = grpc.credentials.createSsl();
							break;
						default:
							throw new Error(
								"Invalid SSL mode: ".concat(
									sslMode,
									" (must be one of disable, require, verify-ca)",
								),
							);
					}
					if (queryParams.apikey) {
						credentials = addApiKeyToCredentials(
							credentials,
							queryParams.apikey,
						);
					} else if (queryParams.bearertoken) {
						credentials = addBearerTokenToCredentials(
							credentials,
							queryParams.bearertoken,
						);
					}
					clientStub = new clientStub_1.DgraphClientStub(
						"".concat(host, ":").concat(port),
						credentials,
					);
					if (!(parsedUrl.username != "")) return [3, 4];
					if (!(parsedUrl.password === "")) return [3, 1];
					throw new Error(
						"Invalid connection string: password required when username is provided",
					);
				case 1:
					_a.trys.push([1, 3, , 4]);
					return [4, clientStub.login(parsedUrl.username, parsedUrl.password)];
				case 2:
					_a.sent();
					return [3, 4];
				case 3:
					err_1 = _a.sent();
					throw new Error("Failed to sign in user: ".concat(err_1.message));
				case 4:
					return [2, new DgraphClient(clientStub)];
			}
		});
	});
}
