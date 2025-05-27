const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Add any modules that need to be transpiled here
        ],
      },
    },
    argv
  );

  // Customize the config before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    // Add any aliases here
  };

  // Use our custom HTML template
  config.plugins[0].options.template = path.resolve(__dirname, 'web/index.html');

  return config;
};
