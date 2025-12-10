import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ILlmContextKeyword, MetadataSourceType } from './llmKeywordGraphTypes';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface KnowledgeGraphProps {
    data: ILlmContextKeyword[];
    onNodeClick?: (node: any) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: 'root' | 'category' | 'topic' | 'keyword';
    radius: number;
    color: string;
    data?: ILlmContextKeyword;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    source: string | GraphNode;
    target: string | GraphNode;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data, onNodeClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Transform flat data into hierarchical graph data
    const graphData = useMemo(() => {
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        const nodeMap = new Set<string>();

        const addNode = (id: string, label: string, type: GraphNode['type'], color: string, radius: number, rawData?: ILlmContextKeyword) => {
            if (!nodeMap.has(id)) {
                nodes.push({ id, label, type, radius, color, data: rawData });
                nodeMap.add(id);
            }
        };

        const addLink = (source: string, target: string) => {
            links.push({ source, target });
        };

        // Central Hub
        addNode('ROOT', 'Context', 'root', '#312e81', 40);

        data.forEach(item => {
            const category = item.aiCategory || 'Uncategorized';
            const topic = item.aiTopic || 'General';

            const catId = `CAT_${category}`;
            const topicId = `TOPIC_${category}_${topic}`;
            const itemId = item._id;

            // 1. Category Node
            addNode(catId, category, 'category', '#4f46e5', 25);
            addLink('ROOT', catId);

            // 2. Topic Node
            addNode(topicId, topic, 'topic', '#818cf8', 15);
            addLink(catId, topicId);

            // 3. Keyword Node
            addNode(itemId, item.keyword, 'keyword', '#e0e7ff', 8, item);
            addLink(topicId, itemId);
        });

        return { nodes, links };
    }, [data]);

    useEffect(() => {
        if (!svgRef.current) return;
        const width = svgRef.current.clientWidth;
        const height = 600; // Fixed height

        // Clear previous
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // Group for zoom
        const g = svg.append("g");

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setZoomLevel(event.transform.k);
            });

        svg.call(zoom);

        // Simulation
        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance((d) => {
                // Dynamic distance based on hierarchy
                const target = d.target as GraphNode;
                if (target.type === 'category') return 150;
                if (target.type === 'topic') return 80;
                return 40;
            }))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d: any) => d.radius + 5).iterations(2));

        // Render Links
        const link = g.append("g")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("stroke-width", 1.5);

        // Render Nodes
        const node = g.append("g")
            .selectAll<SVGGElement, GraphNode>("g")
            .data(graphData.nodes)
            .join("g")
            .call(drag(simulation));

        // Node Circles
        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("click", (_event, d) => {
                if (d.type === 'keyword' && onNodeClick) {
                    onNodeClick(d.data);
                }
            });

        // Node Labels
        node.append("text")
            .text(d => d.label)
            .attr("x", d => d.radius + 5)
            .attr("y", 4)
            .attr("font-size", d => d.type === 'keyword' ? "10px" : "12px")
            .attr("font-weight", d => d.type === 'root' ? "bold" : "normal")
            .attr("fill", "#1e293b")
            .style("pointer-events", "none") // Let clicks pass to circle
            .style("text-shadow", "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff");

        // Tooltip title
        node.append("title")
            .text(d => d.label);

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        // Initial Zoom Center
        // svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    }, [graphData, onNodeClick]);

    // Drag behavior helper
    function drag(simulation: d3.Simulation<GraphNode, undefined>) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag<SVGGElement, GraphNode>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    const handleZoomIn = () => {
        if (svgRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
        }
    };

    const handleZoomOut = () => {
        if (svgRef.current) {
            d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1 / 1.3);
        }
    };

    const handleReset = () => {
        if (svgRef.current) {
            d3.select(svgRef.current).transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
        }
    }

    return (
        <div className='py-4'>
            <div className='container mx-auto px-2'>

                <div>Zoom Level: {zoomLevel}</div>

                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <div className="flex justify-between items-center p-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-xs">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#4f46e5]"></span>
                                    <span className="text-slate-600 font-medium">Category</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#818cf8]"></span>
                                    <span className="text-slate-600 font-medium">Topic</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#e0e7ff] border border-slate-300"></span>
                                    <span className="text-slate-600 font-medium">Keyword</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                            <button onClick={handleZoomIn} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" title="Zoom In">
                                <ZoomIn size={20} />
                            </button>
                            <button onClick={handleReset} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" title="Reset View">
                                <RefreshCw size={20} />
                            </button>
                            <button onClick={handleZoomOut} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" title="Zoom Out">
                                <ZoomOut size={20} />
                            </button>
                        </div>
                    </div>

                    <div
                        className='container mx-auto px-2 bg-white'
                    >
                        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
                    </div>

                </div>
            </div>
        </div>
    );
};

const ExportGraph = () => {

    const getRandomDate = (daysAgo: number = 30) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toISOString();
    };

    // Mock Data Generation
    const generateMockData: ILlmContextKeyword[] = [
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d1',
            username: 'dev_user',
            keyword: 'Next.js 14 Server Actions',
            aiCategory: 'Technology',
            aiSubCategory: 'Web Development',
            aiTopic: 'Frontend Frameworks',
            aiSubTopic: 'Data Fetching',
            metadataSourceType: MetadataSourceType.NOTES,
            metadataSourceId: 'src_001',
            hasEmbedding: true,
            vectorEmbeddingStr: '...',
            createdAt: getRandomDate(2)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d2',
            username: 'dev_user',
            keyword: 'Q3 Financial Review',
            aiCategory: 'Business',
            aiSubCategory: 'Finance',
            aiTopic: 'Reporting',
            aiSubTopic: 'Quarterly',
            metadataSourceType: MetadataSourceType.TASKS,
            metadataSourceId: 'src_002',
            hasEmbedding: false,
            vectorEmbeddingStr: '',
            createdAt: getRandomDate(5)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d3',
            username: 'dev_user',
            keyword: 'Docker Containerization',
            aiCategory: 'Technology',
            aiSubCategory: 'DevOps',
            aiTopic: 'Containers',
            aiSubTopic: 'Docker',
            metadataSourceType: MetadataSourceType.INFO_VAULT,
            metadataSourceId: 'src_003',
            hasEmbedding: true,
            vectorEmbeddingStr: '...',
            createdAt: getRandomDate(10)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d4',
            username: 'dev_user',
            keyword: 'Weekend trip to Kyoto',
            aiCategory: 'Personal',
            aiSubCategory: 'Travel',
            aiTopic: 'Japan',
            aiSubTopic: 'Itinerary',
            metadataSourceType: MetadataSourceType.LIFE_EVENTS,
            metadataSourceId: 'src_004',
            hasEmbedding: true,
            vectorEmbeddingStr: '...',
            createdAt: getRandomDate(12)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d5',
            username: 'dev_user',
            keyword: 'Debugging Python asyncio',
            aiCategory: 'Technology',
            aiSubCategory: 'Programming',
            aiTopic: 'Python',
            aiSubTopic: 'Concurrency',
            metadataSourceType: MetadataSourceType.CHAT_LLM,
            metadataSourceId: 'src_005',
            hasEmbedding: false,
            vectorEmbeddingStr: '',
            createdAt: getRandomDate(15)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d6',
            username: 'dev_user',
            keyword: 'Vegan Lasagna Recipe',
            aiCategory: 'Personal',
            aiSubCategory: 'Food',
            aiTopic: 'Recipes',
            aiSubTopic: 'Italian',
            metadataSourceType: MetadataSourceType.NOTES,
            metadataSourceId: 'src_006',
            hasEmbedding: false,
            vectorEmbeddingStr: '',
            createdAt: getRandomDate(1)
        },
        {
            _id: '65f1a2b3c4d5e6f7a8b9c0d7',
            username: 'dev_user',
            keyword: 'AWS Lambda Cold Starts',
            aiCategory: 'Technology',
            aiSubCategory: 'Cloud',
            aiTopic: 'Serverless',
            aiSubTopic: 'Performance',
            metadataSourceType: MetadataSourceType.INFO_VAULT,
            metadataSourceId: 'src_007',
            hasEmbedding: true,
            vectorEmbeddingStr: '...',
            createdAt: getRandomDate(3)
        }
    ];

    return (
        <div>
            <KnowledgeGraph data={generateMockData} onNodeClick={(node) => {
                console.log(node);
            }} />
        </div>
    );
};

export default ExportGraph;