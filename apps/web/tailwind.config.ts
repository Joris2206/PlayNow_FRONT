import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      primary: "#EF6C3C",
      darkBlue: "#233746",
      midBlue: "#47829B",
      lightGray: "#D9D9D9",
    }
  } },
  plugins: [],
};

export default config;
