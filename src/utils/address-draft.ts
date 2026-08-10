let draft: string | null = null;

export function setAddressDraft(id: string) {
  draft = id;
}

export function takeAddressDraft(): string | null {
  const value = draft;
  draft = null;
  return value;
}
