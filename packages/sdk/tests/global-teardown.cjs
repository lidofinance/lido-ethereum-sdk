module.exports = async function () {
  if (globalThis.__ganache_provider__) {
    console.debug('Disconnecting ganache provider...');
    await globalThis.__ganache_provider__.disconnect();
    console.debug('Disconnected ganache provider');
  }
};
