export const uuidToBuffer = (uuid: string): Buffer =>
  Buffer.from(uuid.replace(/-/g, ''), 'hex');
