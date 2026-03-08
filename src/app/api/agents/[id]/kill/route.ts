import { NextRequest, NextResponse } from 'next/server';
import { activeAgents } from '../../../store';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  // Kill agent
  activeAgents.delete(id);
  
  return NextResponse.json({ 
    success: true, 
    message: 'Agent terminated'
  });
}