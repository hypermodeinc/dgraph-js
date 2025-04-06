Object.defineProperty(exports, "__esModule", { value: true });
exports.clientStubFromSlashGraphQLEndpoint = clientStubFromSlashGraphQLEndpoint;
exports.clientStubFromCloudEndpoint = clientStubFromCloudEndpoint;
var grpc = require("@grpc/grpc-js");
var Url = require("url-parse");
var clientStub_1 = require("./clientStub");
var PORT = "443";
function clientStubFromSlashGraphQLEndpoint(graphqlEndpoint, apiKey) {
	return clientStubFromCloudEndpoint(graphqlEndpoint, apiKey);
}
function clientStubFromCloudEndpoint(graphqlEndpoint, apiKey) {
	var url = new Url(graphqlEndpoint);
	var urlParts = url.host.split(".");
	var firstHalf = urlParts[0];
	var secondHalf = "".concat(urlParts.splice(1).join("."), ":").concat(PORT);
	var backenedURL = "".concat(firstHalf, ".grpc.").concat(secondHalf);
	var metaCreds = grpc.credentials.createFromMetadataGenerator(
		(_, callback) => {
			var metadata = new grpc.Metadata();
			metadata.add("authorization", apiKey);
			callback(undefined, metadata);
		},
	);
	var credentials = grpc.credentials.combineChannelCredentials(
		grpc.credentials.createSsl(),
		metaCreds,
	);
	return new clientStub_1.DgraphClientStub(backenedURL, credentials);
}
