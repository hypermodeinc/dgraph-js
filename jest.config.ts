module.exports = {
	testEnvironment: "node",
	transform: {
		".(ts|tsx)": "ts-jest",
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$",
	coverageDirectory: "coverage",
	collectCoverageFrom: [
		"src/**/*.{ts,tsx,js,jsx}",
		"!src/index.{ts,tsx,js,jsx}",
		"!src/generated/**/*.{ts,tsx,js,jsx}",
		"!src/**/*.d.ts",
	],
};
