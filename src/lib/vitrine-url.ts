import { headers } from "next/headers";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]);

type RequestInfo = {
  host: string | null;
  forwardedProto: string | null;
};

/**
 * Protocolo real da requisição: respeita `x-forwarded-proto` (proxy/HTTPS) e,
 * na ausência, assume http apenas para hosts locais.
 */
function resolveProtocolo({ host, forwardedProto }: RequestInfo): "http" | "https" {
  const forwarded = forwardedProto?.split(",")[0]?.trim();
  if (forwarded === "http" || forwarded === "https") return forwarded;

  const hostname = (host ?? "").split(":")[0]?.toLowerCase();
  return hostname !== "" && LOCAL_HOSTS.has(hostname) ? "http" : "https";
}

/**
 * URL pública absoluta da vitrine a partir do host da requisição
 * (`null` quando não há contexto HTTP, por exemplo em prerender).
 */
export function buildVitrineUrl(
  request: RequestInfo,
  slug: string
): string | null {
  if (!request.host) return null;

  const proto = resolveProtocolo(request);
  return `${proto}://${request.host}/${slug}`;
}

/** URL pública absoluta da vitrine do lojista (API de request-time). */
export async function getVitrineUrl(slug: string): Promise<string | null> {
  const headersList = await headers();
  return buildVitrineUrl(
    {
      host: headersList.get("host"),
      forwardedProto: headersList.get("x-forwarded-proto"),
    },
    slug
  );
}
