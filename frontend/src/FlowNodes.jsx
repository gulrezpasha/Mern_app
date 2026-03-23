import React from "react";
import { Handle, Position } from "@xyflow/react";

const nodeStyle = {
  background: "#12121a",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "0",
  width: 320,
  boxShadow: "0 0 0 1px #6c63ff22, 0 8px 32px #0006",
  fontFamily: "'Syne', sans-serif",
};

const headerStyle = {
  padding: "10px 16px",
  borderBottom: "1px solid #2a2a3a",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const dot = (color) => ({
  width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0,
});

// ── Input Node ───────────────────────────────────────────────────────────────
export function InputNode({ data }) {
  return (
    <div style={nodeStyle}>
      <div style={{ ...headerStyle, color: "#6c63ff" }}>
        <span style={dot("#6c63ff")} />
        Prompt Input
      </div>
      <div style={{ padding: "12px 16px 16px" }}>
        <textarea
          value={data.prompt}
          onChange={(e) => data.onChange(e.target.value)}
          placeholder="Type your question here…"
          rows={4}
          style={{
            width: "100%",
            background: "#0a0a0f",
            border: "1px solid #2a2a3a",
            borderRadius: 8,
            color: "#e8e8f0",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "10px 12px",
            resize: "vertical",
            outline: "none",
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#6c63ff")}
          onBlur={(e) => (e.target.style.borderColor = "#2a2a3a")}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#6c63ff", border: "2px solid #0a0a0f", width: 12, height: 12 }}
      />
    </div>
  );
}

// ── Result Node ──────────────────────────────────────────────────────────────
export function ResultNode({ data }) {
  const isEmpty = !data.response;
  const isLoading = data.loading;

  return (
    <div style={{ ...nodeStyle, borderColor: isLoading ? "#fbbf2444" : isEmpty ? "#2a2a3a" : "#4ade8044" }}>
      <div style={{ ...headerStyle, color: isLoading ? "#fbbf24" : isEmpty ? "#6b6b8a" : "#4ade80" }}>
        <span style={dot(isLoading ? "#fbbf24" : isEmpty ? "#6b6b8a" : "#4ade80")} />
        {isLoading ? "Processing…" : "AI Response"}
      </div>
      <div
        style={{
          padding: "12px 16px 16px",
          minHeight: 96,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          color: isEmpty ? "#3a3a5a" : "#e8e8f0",
          whiteSpace: "pre-wrap",
          overflowY: "auto",
          maxHeight: 260,
        }}
      >
        {isLoading ? (
          <span style={{ color: "#fbbf24" }}>⟳ Thinking…</span>
        ) : isEmpty ? (
          "Response will appear here…"
        ) : (
          data.response
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#4ade80", border: "2px solid #0a0a0f", width: 12, height: 12 }}
      />
    </div>
  );
}