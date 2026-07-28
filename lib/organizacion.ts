export function getOrganizacionLogoUrl(
  logoUrl: string | null | undefined,
) {
  if (!logoUrl) {
    return null;
  }

  if (
    logoUrl.startsWith('http://') ||
    logoUrl.startsWith('https://')
  ) {
    return logoUrl;
  }

  const apiPublicUrl =
    process.env.NEXT_PUBLIC_NEST_API_URL;

  if (!apiPublicUrl) {
    return logoUrl;
  }

  return `${apiPublicUrl.replace(/\/$/, '')}${logoUrl}`;
}