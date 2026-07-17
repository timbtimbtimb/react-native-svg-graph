module.exports = function (api) {
  api.cache(true);

  // Note: we intentionally do NOT use react-native-builder-bob's `getConfig`
  // babel override here. Its `overrides[].include` path pattern breaks Expo
  // 57's metro `getCacheKey`, which loads the babel config without a filename
  // ("Configuration contains string/RegExp pattern, but no filename was passed
  // to Babel"). `babel-preset-expo` already transforms the linked library
  // source (TypeScript + the react-native-worklets plugin), so the override is
  // not needed. The monorepo source aliasing is handled in metro.config.js.
  return {
    presets: ['babel-preset-expo'],
  };
};
