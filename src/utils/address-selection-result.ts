let pendingAddressId: string | null = null;

export function setAddressSelectionResult(addressId: string) {
  pendingAddressId = addressId;
}

export function consumeAddressSelectionResult() {
  const addressId = pendingAddressId;
  pendingAddressId = null;
  return addressId;
}
