const DEFAULT_NATIVE_APP_ORIGIN = 'https://crittergame-jtesdgpd.manus.space';

type CapacitorWindow = Window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
  };
};

export function isNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as CapacitorWindow).Capacitor?.isNativePlatform?.());
}

export function getNativeAppOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_NATIVE_APP_ORIGIN?.trim();
  return (configuredOrigin || DEFAULT_NATIVE_APP_ORIGIN).replace(/\/+$/, '');
}

/**
 * Native bundles run at capacitor://localhost, so durable manuscript-hosted
 * audio and the reviewed adult feedback endpoint need an explicit HTTPS origin.
 * Browser builds retain their same-origin relative paths.
 */
export function resolveNativeNetworkUrl(path: string): string {
  if (!isNativeRuntime() || !path.startsWith('/')) return path;
  return `${getNativeAppOrigin()}${path}`;
}

export function parentFeedbackEnabled(): boolean {
  return import.meta.env.VITE_NATIVE_ENABLE_PARENT_FEEDBACK === 'true';
}
