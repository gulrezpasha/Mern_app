import React, { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InputNode, ResultNode } from "./FlowNodes";

const nodeTypes = { inputNode: InputNode, resultNode: ResultNode };

const INITIAL_NODES = [
  { id: "1", type: "inputNode", position: { x: 80, y: 160 }, data: { prompt: "", onChange: () => {} } },
  { id: "2", type: "resultNode", position: { x: 520, y: 160 }, data: { response: "", loading: false } },
];

const INITIAL_EDGES = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: false,
    style: { stroke: "#6c63ff", strokeWidth: 2 },
  },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const promptRef = useRef("");
  const responseRef = useRef("");

  // Keep prompt ref in sync
  const handlePromptChange = useCallback((value) => {
    promptRef.current = value;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === "1"
          ? { ...n, data: { ...n.data, prompt: value, onChange: handlePromptChange } }
          : n
      )
    );
  }, [setNodes]);

  // Inject onChange into node data on first render
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === "1" ? { ...n, data: { ...n.data, onChange: handlePromptChange } } : n
      )
    );
  }, [handlePromptChange, setNodes]);

  // ── Animate edge while loading ──────────────────────────────────────────
  const setEdgeAnimated = (animated) => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated,
        style: { stroke: animated ? "#fbbf24" : "#6c63ff", strokeWidth: 2 },
      }))
    );
  };

  // ── Run Flow ────────────────────────────────────────────────────────────
  const handleRun = async () => {
    const prompt = promptRef.current.trim();
    if (!prompt) return;
    setLoading(true);
    setEdgeAnimated(true);
    responseRef.current = "";

    setNodes((nds) =>
      nds.map((n) =>
        n.id === "2" ? { ...n, data: { ...n.data, response: "", loading: true } } : n
      )
    );

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const answer = data.answer ?? data.error ?? "Unknown error";
      responseRef.current = answer;

      setNodes((nds) =>
        nds.map((n) =>
          n.id === "2" ? { ...n, data: { ...n.data, response: answer, loading: false } } : n
        )
      );
    } catch (err) {
      const msg = "Network error — is the backend running?";
      responseRef.current = msg;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === "2" ? { ...n, data: { ...n.data, response: msg, loading: false } } : n
        )
      );
    } finally {
      setLoading(false);
      setEdgeAnimated(false);
    }
  };

  // ── Save to MongoDB ─────────────────────────────────────────────────────
  const handleSave = async () => {
    const prompt = promptRef.current.trim();
    const response = responseRef.current.trim();
    if (!prompt || !response) return;

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response }),
      });
      const data = await res.json();
      setSaveStatus(data.success ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const saveLabel = {
    null: "Save to DB",
    saving: "Saving…",
    saved: "✓ Saved!",
    error: "✗ Failed",
  }[saveStatus];

  const saveBg = {
    null: "#1e1e2e",
    saving: "#1e1e2e",
    saved: "#166534",
    error: "#7f1d1d",
  }[saveStatus];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* ── Top Bar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56,
        background: "#0d0d15",
        borderBottom: "1px solid #1e1e2e",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#6c63ff,#ff6584)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "#e8e8f0" }}>
            FutureBlink 
          </span>
         
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} disabled={saveStatus === "saving"}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "1px solid #2a2a3a",
              background: saveBg, color: saveStatus === "saved" ? "#4ade80" : saveStatus === "error" ? "#f87171" : "#a0a0c0",
              fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13,
              cursor: "pointer", transition: "all 0.2s",
            }}>
            {saveLabel}
          </button>

          <button onClick={handleRun} disabled={loading}
            style={{
              padding: "8px 22px", borderRadius: 8, border: "none",
              background: loading ? "#3a3060" : "linear-gradient(135deg,#6c63ff,#8b5cf6)",
              color: "#fff", fontFamily: "'Syne', sans-serif",
              fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 0 20px #6c63ff44",
              transition: "all 0.2s", letterSpacing: "0.02em",
            }}>
            {loading ? "Running…" : "▶ Run Flow"}
          </button>
        </div>
      </header>

      {/* ── React Flow Canvas ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e1e2e" />
          <Controls style={{
            background: "#e4e4ec", border: "1px solid #2a2a3a", borderRadius: 10,
            overflow: "hidden",
          }} />
          
        </ReactFlow>
      </div>
    </div>
  );
}
