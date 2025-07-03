module.exports = async function () {
  console.debug('Starting teardown...');
  
  // Don't await disconnect to avoid hanging
  if (globalThis.__ganache_provider__) {
    console.debug('Disconnecting ganache provider...');
    try {
      globalThis.__ganache_provider__.disconnect();
      globalThis.__ganache_provider__ = null;
    } catch (error) {
      console.debug('Error disconnecting ganache provider:', error.message);
    }
  }
  
  if (globalThis.__l2_ganache_provider__) {
    console.debug('Disconnecting L2 ganache provider...');
    try {
      globalThis.__l2_ganache_provider__.disconnect();
      globalThis.__l2_ganache_provider__ = null;
    } catch (error) {
      console.debug('Error disconnecting L2 ganache provider:', error.message);
    }
  }
  
  console.debug('Teardown completed');
};
