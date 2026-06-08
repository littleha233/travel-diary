import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { City } from '@/types/city';
import { Spot } from '@/types/spot';
import { theme } from '@/theme/theme';

type ChinaMapPoint = {
  id: string;
  kind: 'city' | 'spot';
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  status: 'lit' | 'available' | 'wishlist' | 'locked';
};

type ChinaMapWebViewProps = {
  cities: City[];
  spots: Spot[];
  onPointPress: (point: { kind: 'city' | 'spot'; id: string }) => void;
};

function getMapHtml(points: ChinaMapPoint[]) {
  const pointJson = JSON.stringify(points).replace(/</g, '\\u003c');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; background: #111827; }
      .leaflet-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .leaflet-popup-content-wrapper {
        border-radius: 14px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
      }
      .popup-title { font-weight: 800; color: #1f2937; margin-bottom: 4px; }
      .popup-subtitle { color: #64748b; font-size: 12px; }
      .source-badge {
        position: absolute;
        left: 12px;
        bottom: 12px;
        z-index: 500;
        background: rgba(17, 24, 39, 0.72);
        color: #e5e7eb;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        font-weight: 700;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="source-badge">Leaflet / OpenStreetMap</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const points = ${pointJson};
      const map = L.map('map', {
        zoomControl: false,
        attributionControl: true
      }).setView([35.8617, 104.1954], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      function getColor(point) {
        if (point.kind === 'city') {
          return point.status === 'lit' ? '#78E6D6' : '#B79CFF';
        }
        if (point.status === 'wishlist') {
          return '#FFD66E';
        }
        return point.status === 'lit' ? '#78E6D6' : '#8DBBFF';
      }

      function postPoint(point) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({ kind: point.kind, id: point.id }));
      }

      const bounds = [];
      points.forEach((point) => {
        const latlng = [point.latitude, point.longitude];
        bounds.push(latlng);
        const marker = L.circleMarker(latlng, {
          radius: point.kind === 'city' ? 8 : 6,
          color: '#111827',
          weight: 2,
          fillColor: getColor(point),
          fillOpacity: 0.92
        }).addTo(map);
        marker.bindPopup('<div class="popup-title">' + point.name + '</div><div class="popup-subtitle">' + point.subtitle + '</div>');
        marker.on('click', () => postPoint(point));
      });

      if (bounds.length) {
        map.fitBounds(bounds, { padding: [34, 34], maxZoom: 8 });
      }
    </script>
  </body>
</html>`;
}

export function ChinaMapWebView({ cities, spots, onPointPress }: ChinaMapWebViewProps) {
  const points = useMemo<ChinaMapPoint[]>(
    () => [
      ...cities.map((city) => ({
        id: city.id,
        kind: 'city' as const,
        name: city.name,
        subtitle: `${city.province} · ${city.lit ? '已点亮' : city.wished ? '心愿城市' : '未点亮'}`,
        latitude: city.coordinates.latitude,
        longitude: city.coordinates.longitude,
        status: city.lit ? ('lit' as const) : city.wished ? ('wishlist' as const) : ('available' as const),
      })),
      ...spots.map((spot) => ({
        id: spot.id,
        kind: 'spot' as const,
        name: spot.name,
        subtitle: `${spot.distance} · ${spot.tags.join(' / ')}`,
        latitude: spot.coordinates.latitude,
        longitude: spot.coordinates.longitude,
        status: spot.status,
      })),
    ],
    [cities, spots]
  );
  const html = useMemo(() => getMapHtml(points), [points]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { kind?: 'city' | 'spot'; id?: string };
      if (payload.kind && payload.id) {
        onPointPress({ kind: payload.kind, id: payload.id });
      }
    } catch {
      // Ignore malformed messages from the embedded map.
    }
  };

  return (
    <View style={styles.wrap}>
      <WebView
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled
        nestedScrollEnabled
        onMessage={handleMessage}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.black,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    height: 560,
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: theme.colors.black,
    flex: 1,
  },
});
