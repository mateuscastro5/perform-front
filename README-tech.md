# alphaSights Insights

A desktop application for data analysis and insights, built with React, TypeScript, Vite and Electron.

## Features

- Modern and responsive interface with Tailwind CSS
- Dashboard with metrics and visualizations
- Performance and productivity analysis
- Pull requests and commits management
- Integrated user profile

## Technologies Used

- React 19
- TypeScript
- Electron
- Vite
- Tailwind CSS

## Available Commands

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Distribution (Windows)
```bash
npm run dist:win
```

## Project Structure

- `src/electron/` - Electron main process code
- `src/ui/` - React interface
- `src/shared/` - Shared types and constants

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
