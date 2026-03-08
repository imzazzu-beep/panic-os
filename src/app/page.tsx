"use client";

import { useState } from "react";

// Agent Hub Component
function AgentHub() {
  const agents = [
    { id: 1, name: "Builder", role: "Execution Engine", status: "active", task: "Deploying Panic OS", tag: "Pragmatic", icon: "🛠️" },
    { id: 2, name: "Researcher", role: "Information Gatherer", status: "idle", task: "Awaiting query", tag: "Thorough", icon: "🔍" },
    { id: 3, name: "QA", role: "Quality Assurance", status: "thinking", task: "Analyzing test results", tag: "Analytical", icon: "🧪" },
    { id: 4, name: "Docs", role: "Documentation", status: "active", task: "Writing API docs", tag: "Detail-oriented", icon: "📝" },
    { id: 5, name: "Reviewer", role: "Code Reviewer", status: "idle", task: "Awaiting PR", tag: "Critical", icon: "👁️" },
    { id: 6, name: "Panic", role: "Coordinator", status: "active", task: "Orchestrating tasks", tag: "Strategic", icon: "⚡" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]";
      case "thinking": return "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse";
      case "idle": return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> AGENT HUB
        </h2>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          4 ACTIVE
          <span className="w-2 h-2 rounded-full bg-yellow-500 ml-4 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          2 IDLE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 hover:border-red-500/50 transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{agent.icon}</div>
                <div>
                  <h3 className="font-semibold text-red-400">{agent.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{agent.role}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
            </div>
            
            <div className="bg-[#0f0f0f] rounded p-3 mb-3">
              <div className="text-xs text-gray-500 mb-1">CURRENT TASK</div>
              <div className="text-sm">{agent.task}</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono px-2 py-1 bg-red-500/10 text-red-400 rounded">
                {agent.tag}
              </span>
              <span className={`text-xs font-mono uppercase ${agent.status === "active" ? "text-green-400" : agent.status === "thinking" ? "text-cyan-400" : "text-yellow-400"}`}>
                {agent.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Boardroom Component
function Boardroom() {
  const meetings = [
    { id: 1, title: "Daily Standup", participants: ["Builder", "QA", "Docs"], status: "ongoing", time: "10:00 AM" },
    { id: 2, title: "Architecture Review", participants: ["Builder", "Panic", "Reviewer"], status: "scheduled", time: "2:00 PM" },
    { id: 3, title: "Sprint Planning", participants: ["All Agents"], status: "scheduled", time: "Tomorrow" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> BOARDROOM
        </h2>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          + New Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-400">Meetings</h3>
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{meeting.title}</h4>
                <span className={`text-xs font-mono px-2 py-1 rounded ${meeting.status === "ongoing" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {meeting.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{meeting.time}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Participants:</span>
                <span className="text-sm">{meeting.participants.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-left hover:border-red-500/50 transition-all">
              <div className="font-medium">Start Voice Chat</div>
              <div className="text-xs text-gray-500">Begin an audio discussion with agents</div>
            </button>
            <button className="w-full p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-left hover:border-red-500/50 transition-all">
              <div className="font-medium">Schedule Meeting</div>
              <div className="text-xs text-gray-500">Plan a future discussion</div>
            </button>
            <button className="w-full p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-left hover:border-red-500/50 transition-all">
              <div className="font-medium">View Transcripts</div>
              <div className="text-xs text-gray-500">Access past meeting records</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Command Chat Component
function CommandChat() {
  const [messages, setMessages] = useState([
    { id: 1, agent: "Panic", text: "Welcome to Command. How can I help you today?", time: "10:00 AM", self: false },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: messages.length + 1, agent: "You", text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: true };
    setMessages([...messages, newMsg]);
    setInput("");
    
    setTimeout(() => {
      const response = { id: messages.length + 2, agent: "Builder", text: `Received: "${input}". Processing your request...`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: false };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> COMMAND CHAT
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Connected
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.self ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${msg.self ? "bg-red-600 text-white" : "bg-[#0f0f0f] border border-[#2a2a2a]"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold">{msg.agent}</span>
                  <span className="text-xs opacity-50">{msg.time}</span>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[#2a2a2a] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your command..."
            className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Orchestration Feed Component
function OrchestrationFeed() {
  const activities = [
    { id: 1, agent: "Builder", action: "completed task", target: "Deploy Panic OS", time: "2m ago", type: "success" },
    { id: 2, agent: "Researcher", action: "found", target: "47 relevant results", time: "5m ago", type: "info" },
    { id: 3, agent: "QA", action: "running tests on", target: "v2.1.0", time: "8m ago", type: "warning" },
    { id: 4, agent: "Reviewer", action: "approved PR", target: "#142", time: "12m ago", type: "success" },
    { id: 5, agent: "Docs", action: "updated", target: "API documentation", time: "15m ago", type: "info" },
    { id: 6, agent: "Panic", action: "orchestrated", target: "new sprint planning", time: "20m ago", type: "info" },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> ORCHESTRATION FEED
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] hover:border-red-500/30 transition-all">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${getTypeColor(activity.type).replace("text", "bg")}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-red-400 font-mono font-semibold">{activity.agent}</span>
                  <span className="text-gray-500">{activity.action}</span>
                  <span className={getTypeColor(activity.type)}>{activity.target}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1 font-mono">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Projects Board Component
function ProjectsBoard() {
  const projects = [
    { id: 1, name: "Panic OS Dashboard", status: "in-progress", priority: "high", progress: 75 },
    { id: 2, name: "Agent API Integration", status: "todo", priority: "high", progress: 0 },
    { id: 3, name: "Documentation Site", status: "done", priority: "medium", progress: 100 },
    { id: 4, name: "Testing Framework", status: "in-progress", priority: "medium", progress: 45 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "in-progress": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "todo": return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> PROJECTS BOARD
        </h2>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-red-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${getPriorityColor(project.priority)}`}>
                  {project.priority.toUpperCase()}
                </span>
                <span className={`text-xs font-mono px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                  {project.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-[#0f0f0f] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2 font-mono">{project.progress}% complete</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
type Section = "agents" | "boardroom" | "command" | "feed" | "projects";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("agents");

  const renderSection = () => {
    switch (activeSection) {
      case "agents":
        return <AgentHub />;
      case "boardroom":
        return <Boardroom />;
      case "command":
        return <CommandChat />;
      case "feed":
        return <OrchestrationFeed />;
      case "projects":
        return <ProjectsBoard />;
      default:
        return <AgentHub />;
    }
  };

  const navItems = [
    { id: "agents", label: "AGENT HUB", icon: "🤖" },
    { id: "boardroom", label: "BOARDROOM", icon: "👥" },
    { id: "command", label: "COMMAND", icon: "💬" },
    { id: "feed", label: "ORCHESTRATION", icon: "📡" },
    { id: "projects", label: "PROJECTS", icon: "📋" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#141414] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              P
            </div>
            <h1 className="text-xl font-bold tracking-wider">
              PANIC <span className="text-red-500">OS</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="border-b border-[#2a2a2a] bg-[#0f0f0f] px-6">
        <div className="flex gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                activeSection === item.id
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Stats Bar */}
      <div className="bg-[#0f0f0f] border-b border-[#2a2a2a] px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded">
            <div className="text-2xl font-mono font-bold text-red-400 shadow-red-500">6</div>
            <div className="text-xs font-mono text-gray-500 mt-1">AGENTS</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded">
            <div className="text-2xl font-mono font-bold text-green-400">4</div>
            <div className="text-xs font-mono text-gray-500 mt-1">ACTIVE</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded">
            <div className="text-2xl font-mono font-bold text-red-400">12</div>
            <div className="text-xs font-mono text-gray-500 mt-1">TASKS</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded">
            <div className="text-2xl font-mono font-bold text-blue-400">8</div>
            <div className="text-xs font-mono text-gray-500 mt-1">PROJECTS</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {renderSection()}
      </div>
    </main>
  );
}
