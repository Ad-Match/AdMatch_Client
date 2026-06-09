import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF6F9',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#18181b',
            letterSpacing: -3,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          AM
        </div>
      </div>
    ),
    { ...size },
  );
}
