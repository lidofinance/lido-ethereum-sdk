export enum ErrorMessage {
  NOT_ENOUGH_ETHER = "Not enough ether for gas.",
  DENIED_SIG = "User denied the transaction signature.",
  SOMETHING_WRONG = "Something went wrong.",
  ENABLE_BLIND_SIGNING = "Please enable blind signing on your Ledger hardware wallet.",
  LIMIT_REACHED = "Transaction could not be completed because stake limit is exhausted. Please wait until the stake limit restores and try again. Otherwise, you can swap your Ethereum on 1inch platform instantly.",
  DEVICE_LOCKED = "Please unlock your Ledger hardware wallet",
}

export const getErrorMessage = (
  error: unknown
): { message: ErrorMessage; code: string | number } => {
  try {
    console.error("TX_ERROR:", { error, error_string: JSON.stringify(error) });
  } catch (e) {
    console.error("TX_ERROR:", e);
  }

  const code = extractCodeFromError(error);
  switch (code) {
    case -32000:
    case 3:
    case "UNPREDICTABLE_GAS_LIMIT":
    case "INSUFFICIENT_FUNDS":
      return { message: ErrorMessage.NOT_ENOUGH_ETHER, code: code };
    case "ACTION_REJECTED":
    case 4001:
      return { message: ErrorMessage.DENIED_SIG, code: code };
    case "LIMIT_REACHED":
      return { message: ErrorMessage.LIMIT_REACHED, code: code };
    case "ENABLE_BLIND_SIGNING":
      return { message: ErrorMessage.ENABLE_BLIND_SIGNING, code: code };
    case "DEVICE_LOCKED":
      return { message: ErrorMessage.DEVICE_LOCKED, code: code };
    default:
      return { message: ErrorMessage.SOMETHING_WRONG, code: code };
  }
};

// type safe error code extractor
export const extractCodeFromError = (
  error: unknown,
  shouldDig = true
): number | string => {
  // early exit on non object error
  if (!error || typeof error != "object") return 0;

  if (
    "reason" in error &&
    typeof error.reason == "string" &&
    error.reason.includes("STAKE_LIMIT")
  ) {
    return "LIMIT_REACHED";
    // TODO: error.reason more cases
  }

  // sometimes we have error message but bad error code
  if ("message" in error && typeof error.message == "string") {
    const normalizedMessage = error.message.toLowerCase();
    if (
      normalizedMessage.includes("denied message signature") ||
      normalizedMessage.includes("transaction was rejected") ||
      normalizedMessage.includes("rejected the transaction") ||
      normalizedMessage.includes("rejected the request") ||
      normalizedMessage.includes("reject this request") ||
      normalizedMessage.includes("rejected methods")
    )
      return "ACTION_REJECTED";
  }

  // Ledger live errors
  if (
    "data" in error &&
    typeof error.data === "object" &&
    Array.isArray(error.data) &&
    typeof error.data["0"] === "object" &&
    typeof error.data["0"].message === "string" &&
    error.data["0"].message.toLowerCase().includes("rejected")
  ) {
    return "ACTION_REJECTED";
  }

  if ("name" in error && typeof error.name == "string") {
    const error_name = error.name.toLowerCase();
    if (error_name === "EthAppPleaseEnableContractData".toLowerCase())
      return "ENABLE_BLIND_SIGNING";
    if (error_name === "LockedDeviceError".toLowerCase()) {
      return "DEVICE_LOCKED";
    }
  }
  if ("code" in error) {
    if (typeof error.code === "string") return error.code.toUpperCase();
    if (typeof error.code == "number") return error.code;
  }

  // errors are sometimes nested :(
  if ("error" in error && shouldDig && error.error) {
    return extractCodeFromError(error.error, false);
  }

  return 0;
};
