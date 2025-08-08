import { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { jotaiNotesModalOpenStatus, jotaiStateNotesWorkspaceId, jotaiStateNotesWorkspaceRefresh } from '../stateJotai/notesStateJotai.ts';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import axiosCustom from '../../../../../config/axiosCustom.ts';

// TypeScript type for menu items
export type MenuItem = {
    _id: string;
    title: string;
    parent: string;
    order: number;
    isStar?: boolean;
};

const ComponentFolderAndFileList = () => {
    const [workspaceId] = useAtom(jotaiStateNotesWorkspaceId);

    const setStateNotesModalOpenStatus  = useSetAtom(jotaiNotesModalOpenStatus);

    // Use _id instead of name for active and expanded items
    const [activeItem, setActiveItem] = useState<string>('8'); // '8' is the _id for 'Getting Started'
    // Use array of string for expandedItems
    const [expandedItems, setExpandedItems] = useState<string[]>(['8']);
    const workspaceRefresh = useAtomValue(jotaiStateNotesWorkspaceRefresh);

    // Flat array structure with MongoDB-style IDs and parent relationships
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        // Top level items (parent: '0')
        // { _id: '1', title: 'HF voice activity', parent: '0', order: 1 },
        // { _id: '2', title: 'Ai notes', parent: '0', order: 2 },
        // { _id: '3', title: 'Roadmap', parent: '0', order: 3 },
        // { _id: '4', title: 'Notes', parent: '0', order: 4 },
        // { _id: '5', title: 'Finance', parent: '0', order: 5 },
        // { _id: '6', title: 'Contacts Tasks', parent: '0', order: 6 },
        // { _id: '7', title: 'Work timeline', parent: '0', order: 7 },
        // { _id: '8', title: 'Getting Started', parent: '0', order: 8, isStar: true },
        // { _id: '9', title: 'Finance CRUD App Tasks Breakdown', parent: '0', order: 9 },

        // // HF voice activity sub-items
        // { _id: '10', title: 'Recording Sessions', parent: '1', order: 1 },
        // { _id: '11', title: 'Voice Analytics', parent: '1', order: 2 },
        // { _id: '12', title: 'Session 1 - Daily Standup', parent: '10', order: 1 },
        // { _id: '13', title: 'Session 2 - Client Call', parent: '10', order: 2 },
        // { _id: '14', title: 'Session 3 - Team Review', parent: '10', order: 3 },
        // { _id: '15', title: 'Sentiment Analysis', parent: '11', order: 1 },
        // { _id: '16', title: 'Speech Patterns', parent: '11', order: 2 },

        // // Ai notes sub-items
        // { _id: '17', title: 'Meeting Notes', parent: '2', order: 1 },
        // { _id: '18', title: 'Quick Notes', parent: '2', order: 2 },
        // { _id: '19', title: 'Ideas & Brainstorming', parent: '2', order: 3 },
        // { _id: '20', title: 'Q1 Planning Meeting', parent: '17', order: 1 },
        // { _id: '21', title: 'Project Kickoff', parent: '17', order: 2 },
        // { _id: '22', title: 'Weekly Sync', parent: '17', order: 3 },

        // // Roadmap sub-items
        // { _id: '23', title: '2025 Goals', parent: '3', order: 1 },
        // { _id: '24', title: 'Feature Requests', parent: '3', order: 2 },
        // { _id: '25', title: 'Bug Tracking', parent: '3', order: 3 },
        // { _id: '26', title: 'Q1 Objectives', parent: '23', order: 1 },
        // { _id: '27', title: 'Q2 Objectives', parent: '23', order: 2 },
        // { _id: '28', title: 'Annual Targets', parent: '23', order: 3 },

        // // Notes sub-items
        // { _id: '29', title: 'Personal Notes', parent: '4', order: 1 },
        // { _id: '30', title: 'Research Notes', parent: '4', order: 2 },
        // { _id: '31', title: 'Project Notes', parent: '4', order: 3 },
        // { _id: '32', title: 'Frontend Development', parent: '31', order: 1 },
        // { _id: '33', title: 'Backend API', parent: '31', order: 2 },
        // { _id: '34', title: 'Database Design', parent: '31', order: 3 },

        // // Finance sub-items
        // { _id: '35', title: 'Budget Planning', parent: '5', order: 1 },
        // { _id: '36', title: 'Invoices', parent: '5', order: 2 },
        // { _id: '37', title: 'Tax Documents', parent: '5', order: 3 },
        // { _id: '38', title: '2025 Budget', parent: '35', order: 1 },
        // { _id: '39', title: 'Monthly Expenses', parent: '35', order: 2 },
        // { _id: '40', title: 'Revenue Projections', parent: '35', order: 3 },

        // // Contacts Tasks sub-items
        // { _id: '41', title: 'Client Management', parent: '6', order: 1 },
        // { _id: '42', title: 'Team Contacts', parent: '6', order: 2 },
        // { _id: '43', title: 'Vendor List', parent: '6', order: 3 },
        // { _id: '44', title: 'Active Clients', parent: '41', order: 1 },
        // { _id: '45', title: 'Potential Leads', parent: '41', order: 2 },
        // { _id: '46', title: 'Follow-up Tasks', parent: '41', order: 3 },

        // // Work timeline sub-items
        // { _id: '47', title: 'Current Sprint', parent: '7', order: 1 },
        // { _id: '48', title: 'Completed Tasks', parent: '7', order: 2 },
        // { _id: '49', title: 'Upcoming Deadlines', parent: '7', order: 3 },
        // { _id: '50', title: 'Sprint Planning', parent: '47', order: 1 },
        // { _id: '51', title: 'Daily Tasks', parent: '47', order: 2 },
        // { _id: '52', title: 'Sprint Review', parent: '47', order: 3 },

        // // Getting Started sub-items
        // { _id: '53', title: 'Setup Guide', parent: '8', order: 1 },
        // { _id: '54', title: 'Tutorials', parent: '8', order: 2 },
        // { _id: '55', title: 'FAQ', parent: '8', order: 3 },
        // { _id: '56', title: 'Support Contact', parent: '8', order: 4 },
        // { _id: '57', title: 'Initial Configuration', parent: '53', order: 1 },
        // { _id: '58', title: 'User Preferences', parent: '53', order: 2 },
        // { _id: '59', title: 'Integration Setup', parent: '53', order: 3 },
        // { _id: '60', title: 'Basic Navigation', parent: '54', order: 1 },
        // { _id: '61', title: 'Advanced Features', parent: '54', order: 2 },
        // { _id: '62', title: 'Tips & Tricks', parent: '54', order: 3 },

        // // Finance CRUD App sub-items
        // { _id: '63', title: 'Development Tasks', parent: '9', order: 1 },
        // { _id: '64', title: 'Testing', parent: '9', order: 2 },
        // { _id: '65', title: 'Documentation', parent: '9', order: 3 },
        // { _id: '66', title: 'Deployment', parent: '9', order: 4 },
        // { _id: '67', title: 'Frontend Components', parent: '63', order: 1 },
        // { _id: '68', title: 'API Endpoints', parent: '63', order: 2 },
        // { _id: '69', title: 'Database Schema', parent: '63', order: 3 },
        // { _id: '70', title: 'Unit Tests', parent: '64', order: 1 },
        // { _id: '71', title: 'Integration Tests', parent: '64', order: 2 },
        // { _id: '72', title: 'User Acceptance Testing', parent: '64', order: 3 },

        // Add 10 levels of parent-child hierarchy for testing
        { _id: '100', title: 'Level 1', parent: '0', order: 100 },
        { _id: '101', title: 'Level 2', parent: '100', order: 101 },
        { _id: '102', title: 'Level 3', parent: '101', order: 102 },
        { _id: '103', title: 'Level 4', parent: '102', order: 103 },
        { _id: '104', title: 'Level 5', parent: '103', order: 104 },
        { _id: '105', title: 'Level 6', parent: '104', order: 105 },
        { _id: '106', title: 'Level 7', parent: '105', order: 106 },
        { _id: '107', title: 'Level 8', parent: '106', order: 107 },
        { _id: '108', title: 'Level 9', parent: '107', order: 108 },
        { _id: '109', title: 'Level 10', parent: '108', order: 109 },

    ]);

    useEffect(() => {
        axiosGetMenuItems();
    }, [workspaceId, workspaceRefresh]);

    const axiosGetMenuItems = async () => {
        try {
            const result = await axiosCustom.post('/api/notes/crud/notesGet', {
                notesWorkspaceId: workspaceId,
            });
            if (result.data.docs) {
                let tempMenuItems: MenuItem[] = [];

                for (let i = 0; i < result.data.docs.length; i++) {
                    const note = result.data.docs[i];
                    tempMenuItems.push({
                        _id: note._id,
                        title: note.title || 'Untitled',
                        parent: '0',
                        order: i + 1,
                        isStar: note.isStar,
                    });
                }

                setMenuItems(tempMenuItems);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Update toggleExpanded to work with array
    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => {
            let tempArr = [];
            let found = false;
            for (let i = 0; i < prev.length; i++) {
                if (prev[i] === itemId) {
                    found = true;
                } else {
                    tempArr.push(prev[i]);
                }
            }
            if (!found) tempArr.push(itemId);
            return tempArr;
        });
    };

    // Build hierarchical structure from flat array
    const hierarchicalItems = useMemo(() => {
        const buildTree = (parentId: string = '0'): (MenuItem & { children?: MenuItem[] })[] => {
            return menuItems
                .filter(item => item.parent === parentId)
                .sort((a, b) => a.order - b.order)
                .map(item => ({
                    ...item,
                    children: buildTree(item._id)
                }));
        };
        return buildTree();
    }, [menuItems]);

    const renderMenuItem = (
        item: MenuItem & { children?: MenuItem[] },
        level: number = 0,
    ) => {
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isActive = activeItem === item._id;
        const isExpanded = expandedItems.includes(item._id);

        const indent = `${level * 10}px`;
        const borderStyle = level > 0 ? {
            borderLeft: '1px solid #374151',
            paddingLeft: '3px',
            height: '100%',
        } : {};
        return (
            <div key={item._id} style={{ paddingLeft: indent, width: '100%', marginTop: 0, marginBottom: 0, ...borderStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                    <div style={{ width: '80%', display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        <Link
                            to={`/user/task-schedule?action=edit&id=${item._id}&workspace=${workspaceId}`}
                            onClick={() => {
                                setActiveItem(item._id);
                                // on selecting an item, close modal
                                setStateNotesModalOpenStatus(false);
                                // if (hasChildren) toggleExpanded(item._id);
                            }}
                            style={{
                                width: '100%',
                                background: isActive ? '#e5e7eb' : 'transparent', // light gray for active
                                color: isActive ? '#111' : '#111', // always black text
                                border: item.isStar && level === 0 ? '2px solid #fbbf24' : 'none',
                                borderRadius: '0.5rem',
                                padding: '6px 8px',
                                textAlign: 'left',
                                fontWeight: 500,
                                fontSize: level === 0 ? '1rem' : '0.85rem',
                                margin: 0,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: 0,
                            }}
                        >
                            <span style={{
                                flex: 1,
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                display: 'block',
                            }}>{item.title}</span>
                        </Link>
                    </div>
                    {hasChildren && (
                        <div
                            style={{ width: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', }}
                            onClick={() => {
                                setActiveItem(item._id);
                                if (hasChildren) toggleExpanded(item._id);
                            }}
                        >
                            <span style={{ marginLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                        </div>
                    )}
                </div>
                {/* Children */}
                {hasChildren && isExpanded && (
                    <div style={{ marginTop: 2, marginBottom: 2 }}>
                        {item.children!.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ background: '#fff', color: '#111' }}>
            <div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {hierarchicalItems.map(item => renderMenuItem(item))}
                </nav>
            </div>
        </div>
    );
};

export default ComponentFolderAndFileList;