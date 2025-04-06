import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
	files: ["**/*.ts"],
	extends: [eslint.configs.recommended, ...tseslint.configs.strict],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
	},
});
