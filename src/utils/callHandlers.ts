export default async function callHandlers(
  ...handlers: Array<Promise<void>>
): Promise<void> {
  const results = await Promise.allSettled(handlers);
  results
    .filter((result) => result.status === 'rejected')
    .forEach((result) => {
      console.log(
        'Something went wrong:',
        (result as PromiseRejectedResult).reason
      );
    });
}
