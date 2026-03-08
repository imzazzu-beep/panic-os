import { NextRequest, NextResponse } from 'next/server';
import { activeAgents } from '../../store';

const AGENT_TYPES: Record<string, any> = {
  builder: { id: 'builder', name: 'Builder', role: 'Execution Engine', icon: '🛠️', tag: 'Pragmatic' },
  researcher: { id: 'researcher', name: 'Researcher', role: 'Information Gatherer', icon: '🔍', tag: 'Thorough' },
  qa: { id: 'qa', name: 'QA', role: 'Quality Assurance', icon: '🧪', tag: 'Analytical' },
  docs: { id: 'docs', name: 'Docs', role: 'Documentation', icon: '📝', tag: 'Detail-oriented' },
  reviewer: { id: 'reviewer', name: 'Reviewer', role: 'Code Reviewer', icon: '👁️', tag: 'Critical' },
  panic: { id: 'panic', name: 'Panic', role: 'Coordinator', icon: '⚡', tag: 'Strategic' },
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const agent = activeAgents.get(id);
  
  if (agent) {
    return NextResponse.json({
      id,
      status: 'active',
      task: agent.task,
      lastActivity: agent.lastActivity
    });
  } else {
    return NextResponse.json({
      id,
      status: 'idle',
      task: 'Awaiting assignment'
    });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const agentType = AGENT_TYPES[id];
  
  if (!agentType) {
    return NextResponse.json({ error: 'Agent type not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    
    // Activate agent
    activeAgents.set(id, {
      id,
      task: body.task || 'General assistance',
      lastActivity: new Date(),
      spawnedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      agent: agentType,
      message: `${agentType.name} agent activated`
    });
  } catch (error) {
    console.error('Error spawning agent:', error);
    return NextResponse.json({ error: 'Failed to spawn agent' }, { status: 500 });
  }
}