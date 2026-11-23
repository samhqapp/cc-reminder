// app.json `expo.version` is the only version. The iOS buildNumber and Android versionCode come from it:
// X*10000 + Y*100 + Z, so 1.0.4 is 10004.
module.exports = ({ config }) => {
  const [x, y, z] = config.version.split('.').map(Number);
  const build = x * 10000 + y * 100 + z;
  return {
    ...config,
    ios: { ...config.ios, buildNumber: String(build) },
    android: { ...config.android, versionCode: build },
  };
};
