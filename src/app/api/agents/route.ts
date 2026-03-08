import { NextRequest, NextResponse } from 'next/server';
import { activeAgents } from '../store';

const AGENT_TYPES: Record<string, any> = {
  builder: { id: 'builder', name: 'Builder', role: 'Execution Engine', icon: '🛠️', tag: 'Pragmatic' },
  researcher: { id: 'researcher', name: 'Researcher', role: 'Information Gatherer', icon: '🔍', tag: 'Thorough' },
  qa: { id: 'qa', name: 'QA', role: 'Quality Assurance', icon: '🧪', tag: 'Analytical' },
  docs: { id: 'docs', name: 'Docs', role: 'Documentation', icon: '📝', tag: 'Detail-oriented' },
  reviewer: { id: 'reviewer', name: 'Reviewer', role: 'Code Reviewer', icon: '👁️', tag: 'Critical' },
  panic: { id: 'panic', name: 'Panic', role: 'Coordinator', icon: '⚡', tag: 'Strategic' },
};

export async function GET() {
  const agents = Object.values(AGENT_TYPES).map(agent => ({
    ...agent,
    status: activeAgents.has(agent.id) ? 'active' : 'idle',
    task: activeAgents.has(agent.id) ? activeAgents.get(agent.id).task : 'Awaiting assignment'
  }));
  
  return NextResponse.json(agents);
}