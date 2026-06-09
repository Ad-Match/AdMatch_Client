import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 800,
            color: '#18181b',
            letterSpacing: -8,
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
