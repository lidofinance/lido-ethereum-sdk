type FetchWithFallbacks = (
  inputs: RequestInfo[],
  init?: RequestInit | undefined,
) => Promise<Response>;

export const fetchWithFallbacks: FetchWithFallbacks = async (inputs, init) => {
  const [input, ...restInputs] = inputs;

  let hostname;
  try {
    const url = new URL(input as string);
    hostname = url.hostname;

    console.debug('Sending request to ' + hostname, init);

    const response = await fetch(input, init);

    if (response.ok) {
      console.debug(`Request to ${hostname} successful`, init);
      return response;
    }

    throw new Error('[fetchWithFallbacks] Response not ok');
  } catch (error) {
    if (!restInputs.length) {
      console.error(`All requests failed`, init);
      throw error;
    }
    return fetchWithFallbacks(restInputs, init);
  }
};
