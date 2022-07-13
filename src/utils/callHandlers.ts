function isRejected(
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult {
  return input.status === 'rejected';
}

export default async function callHandlers(
  ...handlers: Array<Promise<void>>
): Promise<void> {
  const results = await Promise.allSettled(handlers);
  results.filter(isRejected).forEach((result) => {
    console.log('Something went wrong:', result.reason);
  });
}
