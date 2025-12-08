import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextPlugin,
]);

export default eslintConfig;
