Minimal CorticonJS 2.0 TypeScript example 

Project created with "npm i tsc -g", "npx tsc --init".

The following settings had to be made/changed. Essentially avoiding transpilation of the bundle and also setting strict mode false.
"allowJs": true,
"checkJs": false,
"strict": false,
"outDir": "./dist",
"rootDir": "./src",
//"module": "commonjs",