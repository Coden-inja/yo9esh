// Build-time GitHub lookups. Unauthenticated (60 req/h) is plenty for a static build;
// set GITHUB_TOKEN in CI if it ever rate-limits.
export async function getStars(repo: string, fallback: number): Promise<number> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    const token = import.meta.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { stargazers_count?: number };
    return json.stargazers_count ?? fallback;
  } catch {
    return fallback;
  }
}
