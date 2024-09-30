module.exports = async function () {
  if (globalThis.__ganache_provider__) {
    console.debug('Disconnecting ganache provider...');
    await globalThis.__ganache_provider__.disconnect();
    console.debug('Disconnected ganache provider');
  }
  if (globalThis.__l2_ganache_provider__) {
    console.debug('Disconnecting L2 ganache provider...');
    await globalThis.__l2_ganache_provider__.disconnect();
    console.debug('Disconnected  L2 ganache provider');
  }
};
