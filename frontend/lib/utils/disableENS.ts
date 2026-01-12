/**
 * Utility to handle ENS errors on localhost/networks that don't support ENS
 * This wraps contract calls to catch and handle ENS errors gracefully
 */

export function wrapContractCall<T>(
  callFn: () => Promise<T>,
  fallbackValue?: T
): Promise<T> {
  return callFn().catch((error: any) => {
    // If it's an ENS error, log and either return fallback or rethrow
    if (error?.code === 'UNSUPPORTED_OPERATION' &&
        (error?.operation === 'getEnsAddress' || error?.operation?.includes('Ens'))) {
      console.warn('ENS operation not supported on this network, but continuing...');

      if (fallbackValue !== undefined) {
        return fallbackValue;
      }

      // If no fallback, throw a more user-friendly error
      throw new Error('This operation requires a network with ENS support. Please switch to a supported network.');
    }

    // Re-throw other errors
    throw error;
  });
}

/**
 * Suppress ENS errors globally in console (optional)
 * Call this in your app initialization
 */
export function suppressENSWarnings() {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('ENS') || message.includes('getEnsAddress')) {
      // Silently ignore ENS errors in console
      return;
    }
    originalError.apply(console, args);
  };
}
