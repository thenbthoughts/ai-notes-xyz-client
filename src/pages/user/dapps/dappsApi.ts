import axiosCustom from "../../../config/axiosCustom";

export type DappsProject = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    stackHint: string;
    port: number;
    basicAuthUsername: string;
    basicAuthPassword: string;
    manageToken: string;
    gitRepo: string;
    prodUrl: string;
    devUrl: string;
    prodStatus: string;
    devStatus: string;
    devLog?: string;
    starred: boolean;
    updatedAt: string;
};

const listProjects = async (search: string): Promise<DappsProject[]> => {
    const res = await axiosCustom.get('/api/dapps/list', {
        params: search ? { search } : {},
        withCredentials: true,
    });
    if (Array.isArray(res.data?.items)) {
        return res.data.items;
    }
    return [];
};

const createProject = async (payload: { name: string; description: string; stackHint: string; port: number }): Promise<DappsProject> => {
    const res = await axiosCustom.post('/api/dapps/create', payload, { withCredentials: true });
    return res.data.item;
};

const getProject = async (id: string): Promise<DappsProject> => {
    const res = await axiosCustom.get(`/api/dapps/by-id/${id}`, { withCredentials: true });
    return res.data.item;
};

const updateProject = async (id: string, payload: Record<string, unknown>): Promise<DappsProject> => {
    const res = await axiosCustom.post(`/api/dapps/update/${id}`, payload, { withCredentials: true });
    return res.data.item;
};

const promoteProject = async (id: string): Promise<DappsProject> => {
    const res = await axiosCustom.post(`/api/dapps/promote/${id}`, {}, { withCredentials: true });
    return res.data.item;
};

const deleteProject = async (id: string): Promise<void> => {
    await axiosCustom.post(`/api/dapps/delete/${id}`, {}, { withCredentials: true });
};

const buildProject = async (id: string, prompt: string): Promise<DappsProject> => {
    const res = await axiosCustom.post(`/api/dapps/build/${id}`, { prompt }, { withCredentials: true });
    return res.data.item;
};

export {
    listProjects,
    createProject,
    getProject,
    updateProject,
    promoteProject,
    deleteProject,
    buildProject,
};
