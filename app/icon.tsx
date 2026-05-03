import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#16a34a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          fontSize: 18,
          fontWeight: 800,
          color: "white",
          fontFamily: "sans-serif",
          letterSpacing: "-1px",
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
