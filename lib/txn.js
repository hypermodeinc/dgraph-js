var __assign =
	(this && this.__assign) ||
	function () {
		__assign =
			Object.assign ||
			((t) => {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			});
		return __assign.apply(this, arguments);
	};
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
exports.Txn = void 0;
var messages = require("../generated/api_pb");
var client_1 = require("./client");
var errors_1 = require("./errors");
var types = require("./types");
var util_1 = require("./util");
var Txn = (() => {
	function Txn(dc, txnOpts) {
		this.finished = false;
		this.mutated = false;
		this.useReadOnly = false;
		this.useBestEffort = false;
		this.dc = dc;
		this.ctx = new messages.TxnContext();
		var defaultedTxnOpts = __assign(
			{ readOnly: false, bestEffort: false },
			txnOpts,
		);
		this.useReadOnly = defaultedTxnOpts.readOnly;
		this.useBestEffort = defaultedTxnOpts.bestEffort;
		if (this.useBestEffort && !this.useReadOnly) {
			this.dc.debug(
				"Client attempted to query using best-effort without setting the transaction to read-only",
			);
			throw errors_1.ERR_BEST_EFFORT_REQUIRED_READ_ONLY;
		}
	}
	Txn.prototype.query = function (q, metadata, options) {
		return this.queryWithVars(q, undefined, metadata, options);
	};
	Txn.prototype.queryWithVars = function (q, vars, metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var req, varsMap_1;
			return __generator(this, function (_a) {
				if (this.finished) {
					this.dc.debug(
						"Query request (ERR_FINISHED):\nquery = "
							.concat(q, "\nvars = ")
							.concat(vars),
					);
					throw errors_1.ERR_FINISHED;
				}
				req = new messages.Request();
				req.setQuery(q);
				req.setStartTs(this.ctx.getStartTs());
				req.setReadOnly(this.useReadOnly);
				req.setBestEffort(this.useBestEffort);
				if (vars !== undefined) {
					varsMap_1 = req.getVarsMap();
					Object.keys(vars).forEach((key) => {
						var value = vars[key];
						if (typeof value === "string" || value instanceof String) {
							varsMap_1.set(key, value.toString());
						}
					});
				}
				return [2, this.doRequest(req, metadata, options)];
			});
		});
	};
	Txn.prototype.queryRDF = function (q, metadata, options) {
		return this.queryRDFWithVars(q, undefined, metadata, options);
	};
	Txn.prototype.queryRDFWithVars = function (q, vars, metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var req, varsMap_2;
			return __generator(this, function (_a) {
				if (this.finished) {
					this.dc.debug(
						"Query request (ERR_FINISHED):\nquery = "
							.concat(q, "\nvars = ")
							.concat(vars),
					);
					throw errors_1.ERR_FINISHED;
				}
				req = new messages.Request();
				req.setQuery(q);
				req.setStartTs(this.ctx.getStartTs());
				req.setReadOnly(this.useReadOnly);
				req.setBestEffort(this.useBestEffort);
				req.setRespFormat(messages.Request.RespFormat.RDF);
				if (vars !== undefined) {
					varsMap_2 = req.getVarsMap();
					Object.keys(vars).forEach((key) => {
						var value = vars[key];
						if (typeof value === "string" || value instanceof String) {
							varsMap_2.set(key, value.toString());
						}
					});
				}
				return [2, this.doRequest(req, metadata, options)];
			});
		});
	};
	Txn.prototype.mutate = function (mu, metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var req;
			return __generator(this, function (_a) {
				req = new messages.Request();
				req.setStartTs(this.ctx.getStartTs());
				req.setMutationsList([mu]);
				req.setCommitNow(mu.getCommitNow());
				return [2, this.doRequest(req, metadata, options)];
			});
		});
	};
	Txn.prototype.doRequest = function (req, metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var mutationList, resp, c, operation, _a, _b, e_1, _c, _d, _e;
			var _this = this;
			return __generator(this, function (_f) {
				switch (_f.label) {
					case 0:
						mutationList = req.getMutationsList();
						if (this.finished) {
							this.dc.debug(
								"Do request (ERR_FINISHED):\nquery = "
									.concat(req.getQuery(), "\nvars = ")
									.concat(req.getVarsMap()),
							);
							this.dc.debug(
								"Do request (ERR_FINISHED):\nmutation = ".concat(
									(0, util_1.stringifyMessage)(mutationList[0]),
								),
							);
							throw errors_1.ERR_FINISHED;
						}
						if (mutationList.length > 0) {
							if (this.useReadOnly) {
								this.dc.debug(
									"Do request (ERR_READ_ONLY):\nmutation = ".concat(
										(0, util_1.stringifyMessage)(mutationList[0]),
									),
								);
								throw errors_1.ERR_READ_ONLY;
							}
							this.mutated = true;
						}
						req.setStartTs(this.ctx.getStartTs());
						req.setHash(this.ctx.getHash());
						this.dc.debug(
							"Do request:\n".concat((0, util_1.stringifyMessage)(req)),
						);
						c = this.dc.anyClient();
						operation = () =>
							__awaiter(_this, void 0, void 0, function () {
								return __generator(this, (_a) => [
									2,
									c.query(req, metadata, options),
								]);
							});
						_f.label = 1;
					case 1:
						_f.trys.push([1, 3, , 11]);
						_b = (_a = types).createResponse;
						return [4, operation()];
					case 2:
						resp = _b.apply(_a, [_f.sent()]);
						return [3, 11];
					case 3:
						e_1 = _f.sent();
						if (!((0, client_1.isJwtExpired)(e_1) === true)) return [3, 6];
						return [4, c.retryLogin(metadata, options)];
					case 4:
						_f.sent();
						_d = (_c = types).createResponse;
						return [4, operation()];
					case 5:
						resp = _d.apply(_c, [_f.sent()]);
						return [3, 10];
					case 6:
						_f.trys.push([6, 8, , 9]);
						return [4, this.discard(metadata, options)];
					case 7:
						_f.sent();
						return [3, 9];
					case 8:
						_e = _f.sent();
						return [3, 9];
					case 9:
						throw (0, util_1.isAbortedError)(e_1) ||
							(0, util_1.isConflictError)(e_1)
							? errors_1.ERR_ABORTED
							: e_1;
					case 10:
						return [3, 11];
					case 11:
						if (req.getCommitNow()) {
							this.finished = true;
						}
						this.mergeContext(resp.getTxn());
						this.dc.debug(
							"Do request:\nresponse = ".concat(
								(0, util_1.stringifyMessage)(resp),
							),
						);
						return [2, resp];
				}
			});
		});
	};
	Txn.prototype.commit = function (metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var c, operation, e_2;
			var _this = this;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						if (this.finished) {
							throw errors_1.ERR_FINISHED;
						}
						this.finished = true;
						if (!this.mutated) {
							return [2];
						}
						c = this.dc.anyClient();
						operation = () =>
							__awaiter(_this, void 0, void 0, function () {
								return __generator(this, function (_a) {
									return [2, c.commitOrAbort(this.ctx, metadata, options)];
								});
							});
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 8]);
						return [4, operation()];
					case 2:
						_a.sent();
						return [3, 8];
					case 3:
						e_2 = _a.sent();
						if (!((0, client_1.isJwtExpired)(e_2) === true)) return [3, 6];
						return [4, c.retryLogin(metadata, options)];
					case 4:
						_a.sent();
						return [4, operation()];
					case 5:
						_a.sent();
						return [3, 7];
					case 6:
						throw (0, util_1.isAbortedError)(e_2) ? errors_1.ERR_ABORTED : e_2;
					case 7:
						return [3, 8];
					case 8:
						return [2];
				}
			});
		});
	};
	Txn.prototype.discard = function (metadata, options) {
		return __awaiter(this, void 0, void 0, function () {
			var c, operation, e_3;
			var _this = this;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						if (this.finished) {
							return [2];
						}
						this.finished = true;
						if (!this.mutated) {
							return [2];
						}
						this.ctx.setAborted(true);
						c = this.dc.anyClient();
						operation = () =>
							__awaiter(_this, void 0, void 0, function () {
								return __generator(this, function (_a) {
									return [2, c.commitOrAbort(this.ctx, metadata, options)];
								});
							});
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 8]);
						return [4, operation()];
					case 2:
						_a.sent();
						return [3, 8];
					case 3:
						e_3 = _a.sent();
						if (!((0, client_1.isJwtExpired)(e_3) === true)) return [3, 6];
						return [4, c.retryLogin(metadata, options)];
					case 4:
						_a.sent();
						return [4, operation()];
					case 5:
						_a.sent();
						return [3, 7];
					case 6:
						throw (0, util_1.isAbortedError)(e_3) ? errors_1.ERR_ABORTED : e_3;
					case 7:
						return [3, 8];
					case 8:
						return [2];
				}
			});
		});
	};
	Txn.prototype.mergeContext = function (src) {
		if (src === undefined) {
			return;
		}
		this.ctx.setHash(src.getHash());
		if (this.ctx.getStartTs() === 0) {
			this.ctx.setStartTs(src.getStartTs());
		} else if (this.ctx.getStartTs() !== src.getStartTs()) {
			throw new Error("StartTs mismatch");
		}
		for (var _i = 0, _a = src.getKeysList(); _i < _a.length; _i++) {
			var key = _a[_i];
			this.ctx.addKeys(key);
		}
	};
	return Txn;
})();
exports.Txn = Txn;
