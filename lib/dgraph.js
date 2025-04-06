var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = {
						enumerable: true,
						get: () => m[k],
					};
				}
				Object.defineProperty(o, k2, desc);
			}
		: (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
			});
var __exportStar =
	(this && this.__exportStar) ||
	((m, exports) => {
		for (var p in m)
			if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
				__createBinding(exports, m, p);
	});
Object.defineProperty(exports, "__esModule", { value: true });
exports.grpc =
	exports.Latency =
	exports.Facet =
	exports.Value =
	exports.NQuad =
	exports.Version =
	exports.Check =
	exports.TxnContext =
	exports.Request =
	exports.Operation =
		void 0;
__exportStar(require("./types"), exports);
var api_pb_1 = require("../generated/api_pb");
Object.defineProperty(exports, "Operation", {
	enumerable: true,
	get: () => api_pb_1.Operation,
});
Object.defineProperty(exports, "Request", {
	enumerable: true,
	get: () => api_pb_1.Request,
});
Object.defineProperty(exports, "TxnContext", {
	enumerable: true,
	get: () => api_pb_1.TxnContext,
});
Object.defineProperty(exports, "Check", {
	enumerable: true,
	get: () => api_pb_1.Check,
});
Object.defineProperty(exports, "Version", {
	enumerable: true,
	get: () => api_pb_1.Version,
});
Object.defineProperty(exports, "NQuad", {
	enumerable: true,
	get: () => api_pb_1.NQuad,
});
Object.defineProperty(exports, "Value", {
	enumerable: true,
	get: () => api_pb_1.Value,
});
Object.defineProperty(exports, "Facet", {
	enumerable: true,
	get: () => api_pb_1.Facet,
});
Object.defineProperty(exports, "Latency", {
	enumerable: true,
	get: () => api_pb_1.Latency,
});
__exportStar(require("./clientStub"), exports);
__exportStar(require("./client"), exports);
__exportStar(require("./clientStubFromSlash"), exports);
__exportStar(require("./txn"), exports);
__exportStar(require("./errors"), exports);
exports.grpc = require("@grpc/grpc-js");
