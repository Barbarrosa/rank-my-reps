module.exports = config => {
  return {
    ...config,
    output: {
      ...config.output,
      globalObject: "(self || this)"
    }
  };
};
