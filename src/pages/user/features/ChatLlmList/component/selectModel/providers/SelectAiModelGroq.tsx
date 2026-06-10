import { useState, useEffect } from "react";
import Select from "react-select";
import axiosCustom from "../../../../../../../config/axiosCustom";
import { reactSelectPortalProps } from "../reactSelectPortalProps";
import { tsSchemaAiModelListGroq } from "../../../../../../../types/pages/settings/dataModelGroq";

const SelectAiModelGroq = ({
    aiModelName,
    setAiModelName,
    selectRandomModel,
}: {
    aiModelName: string;
    setAiModelName: React.Dispatch<React.SetStateAction<string>>;
    selectRandomModel: number;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListGroq[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoadingModel(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
            setModelArr(response.data.docs);
            setIsLoadingModel(false);
        };
        fetchModelData();
    }, []);

    useEffect(() => {
        if (selectRandomModel >= 1) {
            if (modelArr.length > 0) {
                const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
                setAiModelName(randomModel.id);
            }
        }
    }, [selectRandomModel]);

    useEffect(() => {
        if (aiModelName === '') {
            if (modelArr.length > 0) {
                setAiModelName(modelArr[0].id);
            }
        }
    }, [aiModelName]);

    return (
        <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">GROQ Model</h3>
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.id === aiModelName)?.id || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model) => ({
                        value: model.id,
                        label: `${model.owned_by} - ${model.id}`
                    }))
                }
                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
                {...reactSelectPortalProps}
            />
        </div>
    );
};

export default SelectAiModelGroq;
