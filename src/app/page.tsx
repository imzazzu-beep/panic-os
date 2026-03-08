"use client";

import { useState, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";

// Types
interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  tag: string;
  status: 'active' | 'idle' | 'thinking';
  task: string;
}

interface Meeting {
  id: string;
  title: string;
  participants: string[];
  status: 'active' | 'scheduled' | 'ended';
  createdAt: string;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'user' | 'agent';
}

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Custom hook for WebSocket
function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(API_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to Panic OS server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Panic OS server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
}

// Agent Hub Component
function AgentHub({ socket }: { socket: Socket | null }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const spawnAgent = async (agentId: string) => {
    try {
      await fetch(`${API_URL}/api/agents/${agentId}/spawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'General assistance' })
      });
      fetchAgents();
    } catch (error) {
      console.error('Error spawning agent:', error);
    }
  };

  const killAgent = async (agentId: string) => {
    try {
      await fetch(`${API_URL}/api/agents/${agentId}/kill`, { method: 'POST' });
      fetchAgents();
    } catch (error) {
      console.error('Error killing agent:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]";
      case "thinking": return "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse";
      case "idle": return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> AGENT HUB
        </h2>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          {agents.filter(a => a.status === 'active').length} ACTIVE
          <span className="w-2 h-2 rounded-full bg-yellow-500 ml-4 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          {agents.filter(a => a.status === 'idle').length} IDLE
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
              {agent.status === 'idle' ? (
                <button 
                  onClick={() => spawnAgent(agent.id)}
                  className="text-xs font-mono px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                >
                  ACTIVATE
                </button>
              ) : (
                <button 
                  onClick={() => killAgent(agent.id)}
                  className="text-xs font-mono px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  TERMINATE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Boardroom Component
function Boardroom({ socket }: { socket: Socket | null }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchMeetings();
    fetchAvailableAgents();
    
    if (socket) {
      socket.on('meeting:ended', () => {
        fetchMeetings();
      });
    }
  }, [socket]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meetings`);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      const data = await response.json();
      setAvailableAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const createMeeting = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMeetingTitle,
          participants: selectedAgents
        })
      });
      const meeting = await response.json();
      
      // Start the meeting with agents
      if (socket) {
        socket.emit('meeting:start', {
          meetingId: meeting.id,
          title: meeting.title,
          participants: selectedAgents
        });
      }
      
      setShowCreateModal(false);
      setNewMeetingTitle('');
      setSelectedAgents([]);
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const endMeeting = async (meetingId: string) => {
    try {
      await fetch(`${API_URL}/api/meetings/${meetingId}/end`, { method: 'POST' });
      fetchMeetings();
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          <span className="text-red-500">▸</span> BOARDROOM
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          + New Meeting
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Meeting</h3>
            <input
              type="text"
              value={newMeetingTitle}
              onChange={(e) => setNewMeetingTitle(e.target.value)}
              placeholder="Meeting title..."
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded p-3 mb-4 text-white"
            />
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Select participants:</p>
              <div className="space-y-2">
                {availableAgents.map(agent => (
                  <label key={agent.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAgents([...selectedAgents, agent.id]);
                        } else {
                          setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                        }
                      }}
                      className="rounded bg-[#0f0f0f] border-[#2a2a2a]"
                    />
                    <span>{agent.icon} {agent.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createMeeting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
              >
                Start Meeting
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-400">Active Meetings</h3>
          {meetings.filter(m => m.status === 'active').map((meeting) => (
            <div key={meeting.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{meeting.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-green-500/20 text-green-400">
                    ACTIVE
                  </span>
                  <button
                    onClick={() => endMeeting(meeting.id)}
                    className="text-xs font-mono px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    END
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Participants:</span>
                <span className="text-sm">{meeting.participants.join(", ")}</span>
              </div>
            </div>
          ))}
          {meetings.filter(m => m.status === 'active').length === 0 && (
            <p className="text-gray-500 text-center py-8">No active meetings</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-400">Past Meetings</h3>
          {meetings.filter(m => m.status === 'ended').map((meeting) => (
            <div key={meeting.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{meeting.title}</h4>
                <span className="text-xs font-mono px-2 py-1 rounded bg-gray-500/20 text-gray-400">
                  ENDED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Active Meeting Chat Component
function ActiveMeeting({ socket, meetingId }: { socket: Socket | null; meetingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (!socket || !meetingId) return;

    // Join the meeting room
    socket.emit('meeting:join', meetingId);

    // Load meeting history
    fetch(`${API_URL}/api/meetings/${meetingId}`)
      .then(res => res.json())
      .then(data => {
        setMeeting(data);
        if (data.messages) setMessages(data.messages);
      });

    // Listen for new messages
    socket.on('meeting:message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('meeting:message');
    };
  }, [socket, meetingId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !meetingId) return;
    
    socket.emit('meeting:message', {
      meetingId,
      message: input,
      sender: 'You'
    });
    
    setInput('');
  };

  if (!meetingId) return null;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg h-[500px] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <h3 className="font-semibold">{meeting?.title || 'Meeting'}</h3>
        <span className="text-xs text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${msg.type === 'user' ? "bg-red-600 text-white" : "bg-[#0f0f0f] border border-[#2a2a2a]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold">{msg.sender}</span>
                <span className="text-xs opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
          placeholder="Type your message..."
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
  );
}

// Main Dashboard Component
type Section = "agents" | "boardroom" | "meeting";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("agents");
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  const renderSection = () => {
    switch (activeSection) {
      case "agents":
        return <AgentHub socket={socket} />;
      case "boardroom":
        return <Boardroom socket={socket} />;
      case "meeting":
        return activeMeetingId ? 
          <ActiveMeeting socket={socket} meetingId={activeMeetingId} /> : 
          <div className="text-center py-20 text-gray-500">Select a meeting from the Boardroom</div>;
      default:
        return <AgentHub socket={socket} />;
    }
  };

  const navItems = [
    { id: "agents", label: "AGENT HUB", icon: "🤖" },
    { id: "boardroom", label: "BOARDROOM", icon: "👥" },
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,197,94,0.8)]`}></span>
              {connected ? 'SYSTEM ONLINE' : 'OFFLINE'}
            </div>
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

      {/* Content Area */}
      <div className="p-6">
        {renderSection()}
      </div>
    </main>
  );
}