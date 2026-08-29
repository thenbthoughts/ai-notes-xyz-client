import ComponentAgentUsagePanel from './ComponentAgentUsagePanel.tsx';
import type { AgentTokenUsage } from '../../utils/answerMachinePollingAxios';

export default function ComponentAgentUsageCombined({
    threadUsage,
}: {
    threadUsage?: AgentTokenUsage | null;
}) {
    return <ComponentAgentUsagePanel label="Chat usage" tokenUsage={threadUsage} />;
}
