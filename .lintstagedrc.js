import path from 'node:path';

export default {
  '**/*.+(js|ts|svelte)': (stagedFiles) => {
    const actions = [];

    // 1. Group files by their respective workspace/app directory
    const filesByDir = stagedFiles.reduce((acc, file) => {
      const parts = file.split(path.sep);
      const dir = parts.slice(0, 2).join(path.sep); // e.g., "apps/platform"

      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {});

    // 2. Generate clean, isolated commands for each workspace
    for (const [dir, files] of Object.entries(filesByDir)) {
      // Strip out the root path prefix so the app gets clean local paths
      const relativeFiles = files.map((file) => path.relative(dir, file)).join(' ');

      actions.push(
        `prettier --write ${files.join(' ')} --ignore-unknown`,
        `cd ${dir} && npx eslint --fix ${relativeFiles}`
      );
    }

    return actions;
  },
  '**/*.+(json|md)': 'prettier --write --ignore-unknown'
};
