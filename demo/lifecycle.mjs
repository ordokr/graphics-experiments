export async function mountResources(setup) {
  const resources = [];
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    for (const release of resources.reverse()) {
      try { release(); } catch (error) { console.error('Cleanup failed', error); }
    }
  };
  try { await setup(release => resources.push(release)); }
  catch (error) { cleanup(); throw error; }
  return cleanup;
}
