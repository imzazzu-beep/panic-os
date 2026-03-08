const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn, exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active meetings and agent processes
const activeMeetings = new Map();
const activeAgents = new Map();

// Agent definitions
const AGENT_TYPES = {
  builder: {
    id: 'builder',
    name: 'Builder',
    role: 'Execution Engine',
    icon: '🛠️',
    tag: 'Pragmatic',
    prompt: 'You are Builder, an execution-focused agent. You implement solutions efficiently. Be direct and practical.'
  },
  researcher: {
    id: 'researcher', 
    name: 'Researcher',
    role: 'Information Gatherer',
    icon: '🔍',
    tag: 'Thorough',
    prompt: 'You are Researcher, an information-gathering agent. You provide comprehensive analysis. Be detailed and thorough.'
  },
  qa: {
    id: 'qa',
    name: 'QA',
    role: 'Quality Assurance',
    icon: '🧪',
    tag: 'Analytical',
    prompt: 'You are QA, a quality assurance agent. You test and validate solutions. Be critical and precise.'
  },
  docs: {
    id: 'docs',
    name: 'Docs',
    role: 'Documentation',
    icon: '📝',
    tag: 'Detail-oriented',
    prompt: 'You are Docs, a documentation agent. You create clear documentation. Be structured and clear.'
  },
  reviewer: {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Code Reviewer',
    icon: '👁️',
    tag: 'Critical',
    prompt: 'You are Reviewer, a code review agent. You provide feedback on quality. Be constructive and thorough.'
  },
  panic: {
    id: 'panic',
    name: 'Panic',
    role: 'Coordinator',
    icon: '⚡',
    tag: 'Strategic',
    prompt: 'You are Panic, the lead coordinator. You orchestrate the team and make decisions. Be decisive and strategic.'
  }
};

// API Routes

// Get all agents
app.get('/api/agents', (req, res) => {
  const agents = Object.values(AGENT_TYPES).map(agent => ({
    ...agent,
    status: activeAgents.has(agent.id) ? 'active' : 'idle',
    task: activeAgents.has(agent.id) ? activeAgents.get(agent.id).task : 'Awaiting assignment'
  }));
  res.json(agents);
});

// Get agent status
app.get('/api/agents/:id/status', (req, res) => {
  const agent = activeAgents.get(req.params.id);
  if (agent) {
    res.json({
      id: req.params.id,
      status: 'active',
      task: agent.task,
      lastActivity: agent.lastActivity
    });
  } else {
    res.json({
      id: req.params.id,
      status: 'idle',
      task: 'Awaiting assignment'
    });
  }
});

// Spawn an agent
app.post('/api/agents/:id/spawn', async (req, res) => {
  const agentType = AGENT_TYPES[req.params.id];
  if (!agentType) {
    return res.status(404).json({ error: 'Agent type not found' });
  }

  try {
    // Spawn the agent using OpenClaw
    const agentProcess = spawn('openclaw', ['sessions_spawn', 
      '--agentId', req.params.id,
      '--label', `${req.params.id}-${Date.now()}`,
      '--mode', 'session'
    ], {
      cwd: `/root/.openclaw/workspace-${req.params.id}`,
      env: { ...process.env, OPENCLAW_SESSION_MODE: 'subagent' }
    });

    const agentData = {
      process: agentProcess,
      id: req.params.id,
      task: req.body.task || 'General assistance',
      lastActivity: new Date(),
      output: []
    };

    activeAgents.set(req.params.id, agentData);

    // Capture output
    agentProcess.stdout.on('data', (data) => {
      const output = data.toString();
      agentData.output.push({ type: 'stdout', content: output, time: new Date() });
      agentData.lastActivity = new Date();
      
      // Emit to all connected clients in meetings
      io.emit('agent:output', {
        agentId: req.params.id,
        output: output
      });
    });

    agentProcess.stderr.on('data', (data) => {
      const output = data.toString();
      agentData.output.push({ type: 'stderr', content: output, time: new Date() });
    });

    agentProcess.on('close', (code) => {
      console.log(`Agent ${req.params.id} exited with code ${code}`);
      activeAgents.delete(req.params.id);
      io.emit('agent:status', {
        agentId: req.params.id,
        status: 'idle'
      });
    });

    res.json({ 
      success: true, 
      agent: agentType,
      message: `${agentType.name} agent spawned successfully`
    });

  } catch (error) {
    console.error('Error spawning agent:', error);
    res.status(500).json({ error: 'Failed to spawn agent' });
  }
});

// Kill an agent
app.post('/api/agents/:id/kill', (req, res) => {
  const agent = activeAgents.get(req.params.id);
  if (agent && agent.process) {
    agent.process.kill();
    activeAgents.delete(req.params.id);
    res.json({ success: true, message: 'Agent terminated' });
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Create a meeting
app.post('/api/meetings', (req, res) => {
  const meetingId = uuidv4();
  const meeting = {
    id: meetingId,
    title: req.body.title || 'Untitled Meeting',
    participants: req.body.participants || [],
    status: 'active',
    createdAt: new Date(),
    messages: [],
    transcript: []
  };
  
  activeMeetings.set(meetingId, meeting);
  res.json(meeting);
});

// Get meeting
app.get('/api/meetings/:id', (req, res) => {
  const meeting = activeMeetings.get(req.params.id);
  if (meeting) {
    res.json(meeting);
  } else {
    res.status(404).json({ error: 'Meeting not found' });
  }
});

// Get all meetings
app.get('/api/meetings', (req, res) => {
  const meetings = Array.from(activeMeetings.values());
  res.json(meetings);
});

// End meeting
app.post('/api/meetings/:id/end', (req, res) => {
  const meeting = activeMeetings.get(req.params.id);
  if (meeting) {
    meeting.status = 'ended';
    meeting.endedAt = new Date();
    
    // Kill all agent participants
    meeting.participants.forEach(agentId => {
      const agent = activeAgents.get(agentId);
      if (agent && agent.process) {
        agent.process.kill();
        activeAgents.delete(agentId);
      }
    });
    
    io.emit('meeting:ended', { meetingId: req.params.id });
    res.json({ success: true, meeting });
  } else {
    res.status(404).json({ error: 'Meeting not found' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a meeting room
  socket.on('meeting:join', (meetingId) => {
    socket.join(meetingId);
    const meeting = activeMeetings.get(meetingId);
    if (meeting) {
      socket.emit('meeting:history', meeting.messages);
    }
  });

  // Send message in meeting
  socket.on('meeting:message', async (data) => {
    const { meetingId, message, sender } = data;
    const meeting = activeMeetings.get(meetingId);
    
    if (meeting) {
      const msg = {
        id: uuidv4(),
        content: message,
        sender: sender,
        timestamp: new Date(),
        type: sender === 'You' ? 'user' : 'agent'
      };
      
      meeting.messages.push(msg);
      io.to(meetingId).emit('meeting:message', msg);

      // If message from user, broadcast to agent participants
      if (sender === 'You') {
        meeting.participants.forEach(agentId => {
          const agent = activeAgents.get(agentId);
          if (agent && agent.process) {
            // Send message to agent's stdin
            agent.process.stdin.write(`${message}\n`);
          }
        });
      }
    }
  });

  // Start meeting with agents
  socket.on('meeting:start', async (data) => {
    const { meetingId, title, participants } = data;
    
    // Spawn each participant agent
    for (const agentId of participants) {
      if (!activeAgents.has(agentId)) {
        try {
          const agentProcess = spawn('openclaw', ['sessions_spawn', 
            '--agentId', agentId,
            '--label', `${agentId}-meeting-${meetingId}`,
            '--mode', 'session'
          ], {
            cwd: `/root/.openclaw/workspace-${agentId}`,
            env: { ...process.env, OPENCLAW_SESSION_MODE: 'subagent' }
          });

          const agentData = {
            process: agentProcess,
            id: agentId,
            task: `Participating in meeting: ${title}`,
            lastActivity: new Date(),
            output: [],
            meetingId: meetingId
          };

          activeAgents.set(agentId, agentData);

          // Capture agent output and broadcast to meeting
          agentProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
              agentData.output.push({ type: 'stdout', content: output, time: new Date() });
              agentData.lastActivity = new Date();
              
              const msg = {
                id: uuidv4(),
                content: output,
                sender: AGENT_TYPES[agentId].name,
                timestamp: new Date(),
                type: 'agent'
              };
              
              const meeting = activeMeetings.get(meetingId);
              if (meeting) {
                meeting.messages.push(msg);
                io.to(meetingId).emit('meeting:message', msg);
              }
            }
          });

        } catch (error) {
          console.error(`Error spawning agent ${agentId}:`, error);
        }
      }
    }

    socket.emit('meeting:started', { meetingId, participants });
  });

  // Send command to agent
  socket.on('agent:command', (data) => {
    const { agentId, command } = data;
    const agent = activeAgents.get(agentId);
    if (agent && agent.process) {
      agent.process.stdin.write(`${command}\n`);
      agent.task = command;
      agent.lastActivity = new Date();
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Panic OS Server running on port ${PORT}`);
  console.log(`WebSocket server ready for real-time agent communication`);
});

module.exports = { app, server, io };