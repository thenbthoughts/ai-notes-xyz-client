import { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import axiosCustom from "../../../../config/axiosCustom";
import SettingHeader from "../SettingHeader";

// Interface matching the Mongoose schema
interface IUserDeviceList {
    _id: string;
    username: string;
    randomDeviceId: string;
    isExpired: boolean;
    userAgent: string;
    createdAt: string;
    createdAtIpAddress: string;
    updatedAt: string;
    updatedAtIpAddress: string;
}

const LoginHistory = () => {
    const [deviceData, setDeviceData] = useState<IUserDeviceList[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>(0);

    const [randomNumRefresh, setRandomNumRefresh] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);

    // Define columns for the data table
    const columns: TableColumn<IUserDeviceList>[] = [
        {
            name: <div>Device ID</div>,
            selector: (row: IUserDeviceList) => row.randomDeviceId,
            width: '150px',
            cell: (row: IUserDeviceList) => (
                <div className="font-mono text-xs break-all" title={row.randomDeviceId}>
                    {row.randomDeviceId}
                </div>
            ),
        },
        {
            name: <div>Status</div>,
            selector: (row: IUserDeviceList) => row.isExpired,
            width: '100px',
            cell: (row: IUserDeviceList) => (
                <span
                    className={`px-2 py-1 rounded-sm text-xs font-medium ${row.isExpired
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                >
                    {row.isExpired ? 'Expired' : 'Active'}
                </span>
            ),
        },
        {
            name: <div>User Agent</div>,
            selector: (row: IUserDeviceList) => row.userAgent,
            width: '250px',
            cell: (row: IUserDeviceList) => (
                <div className="text-xs break-words" title={row.userAgent}>
                    {row.userAgent || 'Unknown'}
                </div>
            ),
        },
        {
            name: <div>Login Time</div>,
            selector: (row: IUserDeviceList) => row.createdAt,
            width: '150px',
            cell: (row: IUserDeviceList) => (
                <div className="text-xs">
                    {new Date(row.createdAt).toLocaleDateString()} <br />
                    <span className="text-gray-500">
                        {new Date(row.createdAt).toLocaleTimeString()}
                    </span>
                </div>
            ),
        },
        {
            name: <div>IP Address</div>,
            selector: (row: IUserDeviceList) => row.createdAtIpAddress,
            width: '120px',
            cell: (row: IUserDeviceList) => (
                <div className="font-mono text-xs break-all">
                    {row.createdAtIpAddress || 'N/A'}
                </div>
            ),
        },
        {
            name: <div>Last Updated</div>,
            selector: (row: IUserDeviceList) => row.updatedAt,
            width: '150px',
            cell: (row: IUserDeviceList) => (
                <div className="text-xs">
                    {new Date(row.updatedAt).toLocaleDateString()} <br />
                    <span className="text-gray-500">
                        {new Date(row.updatedAt).toLocaleTimeString()}
                    </span>
                </div>
            ),
        },
        {
            name: <div>Expire Status</div>,
            width: '150px',
            cell: (row: IUserDeviceList) => (
                <div className="flex gap-2">
                    <button
                        className={`px-2 py-1 text-xs rounded-sm ${row.isExpired
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                    >
                        {row.isExpired ? 'Expired' : 'Expire'}
                    </button>
                </div>
            ),
        },
    ];

    const fetchLoginHistory = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post(
                `/api/user/login-history/userLoginHistory`,
                {
                    page: currentPage,
                    perPage: perPage,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            setDeviceData(response.data.docs || []);
            setTotalRows(response.data.count || 0);

        } catch (error) {
            console.error("Error fetching login history:", error);
            setDeviceData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAllRecords = async () => {
        try {
            const response = await axiosCustom.delete(
                `/api/user/login-history/clear-all-records`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            if (response.data?.deletedCount !== undefined) {
                // Refresh the data
                setRandomNumRefresh(randomNumRefresh + 1);
            }

            // Reload the page to ensure fresh authentication state
            window.location.reload();
        } catch (error) {
            console.error("Error clearing all records:", error);
        }
    };

    const handleLogoutAllDevices = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/login-history/logout-all-devices`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );

            if (response.data?.modifiedCount !== undefined) {
                // Refresh the data
                setRandomNumRefresh(randomNumRefresh + 1);
            }

            // Reload the page to ensure fresh authentication state
            window.location.reload();
        } catch (error) {
            console.error("Error logging out all devices:", error);
        }
    };

    useEffect(() => {
        fetchLoginHistory();
    }, [
        currentPage,
        randomNumRefresh,
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        perPage,
    ]);

    // Custom styles for the data table
    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
            },
        },
        headRow: {
            style: {
                borderTopStyle: 'solid' as const,
                borderTopWidth: '1px',
                borderTopColor: '#e2e8f0',
            },
        },
        headCells: {
            style: {
                '&:not(:last-of-type)': {
                    borderRightStyle: 'solid' as const,
                    borderRightWidth: '1px',
                    borderRightColor: '#e2e8f0',
                },
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
            },
        },
        cells: {
            style: {
                '&:not(:last-of-type)': {
                    borderRightStyle: 'solid' as const,
                    borderRightWidth: '1px',
                    borderRightColor: '#f1f5f9',
                },
                fontSize: '12px',
            },
        },
    };

    return (
        <div
            className="p-4"
            style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <SettingHeader />

            <div className="bg-white rounded-sm shadow-sm border">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Login History & Devices</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your active sessions and device history
                    </p>
                </div>

                <div className="p-4 border-b">
                    <div className="flex gap-3">
                        <button
                            onClick={handleLogoutAllDevices}
                            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                        >
                            Logout All Devices
                        </button>
                        <button
                            onClick={handleClearAllRecords}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            Clear All Records
                        </button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={deviceData}
                    progressPending={loading}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationDefaultPage={currentPage}
                    paginationPerPage={perPage}
                    paginationRowsPerPageOptions={[5, 10, 20, 50]}
                    onChangeRowsPerPage={(newPerPage: number, page: number) => {
                        setPerPage(newPerPage);
                        setCurrentPage(page);
                    }}
                    onChangePage={(page: number) => {
                        setCurrentPage(page);
                    }}
                    customStyles={customStyles}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    striped
                    noDataComponent={
                        <div className="p-8 text-center text-gray-500">
                            <p className="text-lg font-medium">No login history found</p>
                            <p className="text-sm mt-1">Your device login history will appear here</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default LoginHistory;