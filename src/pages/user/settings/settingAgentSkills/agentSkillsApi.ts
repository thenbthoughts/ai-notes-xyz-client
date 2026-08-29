import axiosCustom from '../../../../config/axiosCustom';

export type AgentSkillDto = {
    id: string;
    userId: string | null;
    name: string;
    description: string;
    body: string;
    enabled: boolean;
    isBuiltin: boolean;
    isUserOverride?: boolean;
    createdAtUtc: string | null;
    updatedAtUtc: string | null;
};

export const fetchAgentSkills = async (): Promise<AgentSkillDto[]> => {
    const res = await axiosCustom.get('/api/chat-llm/agent-skills');
    return Array.isArray(res.data?.skills) ? res.data.skills : [];
};

export const fetchAgentSkill = async (id: string): Promise<AgentSkillDto> => {
    const res = await axiosCustom.get(`/api/chat-llm/agent-skills/${id}`);
    return res.data.skill;
};

export const createAgentSkill = async (payload: {
    name: string;
    description: string;
    body: string;
    enabled?: boolean;
}): Promise<AgentSkillDto> => {
    const res = await axiosCustom.post('/api/chat-llm/agent-skills', payload);
    return res.data.skill;
};

export const updateAgentSkill = async (
    id: string,
    payload: Partial<{ name: string; description: string; body: string; enabled: boolean }>
): Promise<AgentSkillDto> => {
    const res = await axiosCustom.put(`/api/chat-llm/agent-skills/${id}`, payload);
    return res.data.skill;
};

export const toggleAgentSkill = async (id: string): Promise<AgentSkillDto> => {
    const res = await axiosCustom.post(`/api/chat-llm/agent-skills/${id}/toggle`);
    return res.data.skill;
};

export const deleteAgentSkill = async (id: string): Promise<void> => {
    await axiosCustom.delete(`/api/chat-llm/agent-skills/${id}`);
};

export const duplicateAgentSkill = async (id: string, name?: string): Promise<AgentSkillDto> => {
    const res = await axiosCustom.post(`/api/chat-llm/agent-skills/${id}/duplicate`, name ? { name } : {});
    return res.data.skill;
};
