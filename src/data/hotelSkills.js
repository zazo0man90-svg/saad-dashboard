export const HOTEL_SKILLS_SOURCE = {
  name: 'HospitalityOS',
  repository: 'https://github.com/hospitalityos/hotel-ai-skills',
  revision: '4e6142e72ad37088e0d3a06ccac69baea69dbb01',
  license: 'Proprietary — see the original repository for usage terms.'
};

// Original catalog descriptions. Workflow instructions remain at their official source.
export const hotelSkills = [
  { id: 'revenue-management', title: 'Revenue Management', category: 'Revenue & finance', icon: 'chart', color: 'purple', summary: 'Turn booking pace, room rates, and market demand into a clearer pricing plan.', inputs: ['Booking pace', 'Room rates', 'Market benchmarks'], outputs: ['Pricing recommendations with assumptions', 'Booking pace and channel analysis', 'Priority revenue actions'] },
  { id: 'forecasting-budgeting', title: 'Forecasting & Budgeting', category: 'Revenue & finance', icon: 'activity', color: 'blue', summary: 'Build a forward view of hotel demand, revenue, and operating performance.', inputs: ['Historical results', 'On-the-books business', 'Budget assumptions'], outputs: ['Demand and revenue forecast', 'Scenario assumptions', 'Budget risks and opportunities'] },
  { id: 'pl-variance', title: 'P&L Variance Analysis', category: 'Revenue & finance', icon: 'chart', color: 'green', summary: 'Understand what moved against budget and which operating changes need attention.', inputs: ['Actual P&L', 'Budget', 'Prior-period results'], outputs: ['Variance breakdown', 'Operating drivers and margin impact', 'Corrective action list'] },
  { id: 'labor-optimization', title: 'Labor Optimization', category: 'Operations', icon: 'users', color: 'orange', summary: 'Match staffing plans to hotel demand while keeping service and labor costs in view.', inputs: ['Staffing schedules', 'Demand forecast', 'Labor costs'], outputs: ['Staffing recommendations', 'Productivity and overtime review', 'Scheduling priorities'] },
  { id: 'reputation-intelligence', title: 'Reputation Intelligence', category: 'Guest experience', icon: 'star', color: 'purple', summary: 'Find recurring themes in guest feedback and plan a more consistent response.', inputs: ['Guest reviews', 'Ratings', 'Competitor feedback'], outputs: ['Guest feedback themes', 'Service improvement priorities', 'Draft management responses'] },
  { id: 'competitive-intelligence', title: 'Competitive Intelligence', category: 'Strategy', icon: 'search', color: 'blue', summary: 'Compare your property’s positioning, rates, and offering with its competitive set.', inputs: ['Competitive set', 'Market rates', 'Property positioning'], outputs: ['Competitive comparison', 'Positioning opportunities', 'Market watch list'] },
  { id: 'owner-reporting', title: 'Owner Reporting', category: 'Strategy', icon: 'folder', color: 'green', summary: 'Bring operating and financial findings together in a focused ownership update.', inputs: ['Operating KPIs', 'Financial results', 'Ownership priorities'], outputs: ['Executive performance summary', 'Risks and decision points', 'Next-period action plan'] },
  { id: 'sop-training', title: 'SOP & Training', category: 'Operations', icon: 'shield', color: 'purple', summary: 'Prepare practical operating procedures, onboarding guides, and team training material.', inputs: ['Department', 'Existing procedures', 'Service standards'], outputs: ['Draft operating procedure', 'Training or onboarding checklist', 'Quality review points'] },
  { id: 'sales-pipeline', title: 'Sales Pipeline', category: 'Sales & marketing', icon: 'activity', color: 'orange', summary: 'Review group opportunities, pipeline priorities, and the value of potential business.', inputs: ['Sales pipeline', 'Group opportunities', 'Revenue assumptions'], outputs: ['Opportunity priorities', 'Group business assessment', 'Sales follow-up plan'] },
  { id: 'content-engine', title: 'Sales & Marketing Content', category: 'Sales & marketing', icon: 'folder', color: 'blue', summary: 'Develop a brief for hotel proposals, campaigns, listings, and other marketing content.', inputs: ['Target audience', 'Offer or campaign', 'Brand guidance'], outputs: ['Content draft or campaign outline', 'Audience and channel guidance', 'Review checklist'] }
];

export function skillSourceUrl(skill) {
  return `${HOTEL_SKILLS_SOURCE.repository}/blob/${HOTEL_SKILLS_SOURCE.revision}/hotel-intelligence-suite/skills/${skill.id}/SKILL.md`;
}

export function createSkillProject(skill, { property, objective, context }) {
  const propertyName = property.trim();
  const goal = objective.trim();
  if (!propertyName || !goal) throw new Error('Enter your property name and the goal for this workflow.');
  const source = skillSourceUrl(skill);
  const brief = [
    `# ${skill.title} — project brief`,
    `Property: ${propertyName}`,
    `Workflow: ${skill.title} by ${HOTEL_SKILLS_SOURCE.name}`,
    `Source guide: ${source}`,
    '', '## Objective', goal,
    '', '## Available data and context', context.trim() || 'Not supplied. Request the required hotel data before analysis.',
    '', '## Requested outputs', ...skill.outputs.map(output => `- ${output}`),
    '', '## Working notes',
    'Use the original workflow guide and actual property data. Identify missing inputs, explain assumptions, and do not invent hotel metrics or results.',
    'This is a prepared brief, not a completed AI analysis.'
  ].join('\n');
  return {
    id: crypto.randomUUID(), name: `${propertyName} · ${skill.title}`.slice(0, 80),
    description: goal.slice(0, 300), category: 'Hotel operations', status: 'Planning', progress: 0,
    color: skill.color, skillId: skill.id, skillSource: source, brief
  };
}
