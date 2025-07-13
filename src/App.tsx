import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

// component
import Header from './components/Header';
import NavigationDrawer from './components/NavigationDrawer.tsx';
import UnauthorizedRoute from "./components/UnauthorizedRoute.tsx";
import RefreshToken from "./components/RefreshToken.tsx";
import LlmTaskBackgroundProcess from "./components/LlmTaskBackgroundProcess.tsx";
import AuthorizedRoute from "./components/AuthorizedRoute.tsx";

// pages -> auth
const UserLogin = lazy(() => import('./pages/user/auth/Login.tsx'));
const UserRegister = lazy(() => import('./pages/user/auth/Register.tsx'));
const UserLogout = lazy(() => import('./pages/user/auth/Logout.tsx'));

// pages -> other
const About = lazy(() => import("./pages/other/About.tsx"));
const UserHomepage = lazy(() => import("./pages/user/userhomepage/UserHomepage.tsx"));

// pages -> setting
const Setting = lazy(() => import("./pages/user/settings/Setting.tsx"));

// pages -> ai
const PageChatOneList = lazy(() => import('./pages/user/noteAdvance/pageChatOneList/ChatOneList.tsx'));
const PageChatLlmListWrapper = lazy(() => import('./pages/user/noteAdvance/pageChatLlmList/ChatLlmListWrapper.tsx'));
const AiDeepResearchWrapper = lazy(() => import("./pages/user/noteAdvance/AiDeepResearch/AiDeepResearchWrapper.tsx"));

// pages -> notes
const MemoQuickAi = lazy(() => import('./pages/user/noteAdvance/MemoQuickAi/MemoQuickAi'));
const NotesWrapper = lazy(() => import("./pages/user/noteAdvance/Notes/NotesWrapper.tsx"));
const NotesWorkspaceCrud = lazy(() => import("./pages/user/noteAdvance/NotesWorkspaceCrud/NotesWorkspaceCrud.tsx"));
const InfoVaultWrapper = lazy(() => import("./pages/user/noteAdvance/InfoVault/InfoVaultWrapper.tsx"));
const PageLifeEventsWrapper = lazy(() => import('./pages/user/noteAdvance/pageLifeEventsList/LifeEventWrapper.tsx'));

// pages -> productivity
const TaskList = lazy(() => import("./pages/user/noteAdvance/taskList/TaskList.tsx"));
const TaskWorkspaceCrud = lazy(() => import("./pages/user/noteAdvance/TaskWorkspaceCrud/TaskWorkspaceCrud.tsx"));
const CalendarWrapper = lazy(() => import("./pages/user/noteAdvance/Calendar/CalendarWrapper.tsx"));
const FinanceWrapper = lazy(() => import("./pages/user/noteAdvance/Finance/FinanceWrapper.tsx"));

// pages -> test
const TestDevWrapper = lazy(() => import("./pages/test/testDev/TestDevWrapper.tsx"));

// components -> settings
const ModelOpenrouterInsertAll = lazy(() => import('./components/settings/ModelOpenrouterInsertAll.tsx'));

function App() {
  const Layout = () => {
    return (
      <>
        <Header />
        <NavigationDrawer />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <Outlet />
        </Suspense>
      </>
    );
  }


  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <UserHomepage />,
        },
        {
          path: "/login",
          element: (
            <AuthorizedRoute>
              <UserLogin />
            </AuthorizedRoute>
          )
        },
        {
          path: "/register",
          element: (
            <AuthorizedRoute>
              <UserRegister />
            </AuthorizedRoute>
          ),
        },
        {
          path: "/logout",
          element: (
            <UnauthorizedRoute>
              <UserLogout />
            </UnauthorizedRoute>
          ),
        },

        // protected route
        {
          path: "/user/chat-one",
          element: (
            <UnauthorizedRoute>
              <PageChatOneList />
            </UnauthorizedRoute>
          ),
        },
        {
          path: '/user/chat',
          element: (
            <UnauthorizedRoute>
              <PageChatLlmListWrapper />
            </UnauthorizedRoute>
          )
        },
        {
          path: '/user/life-events',
          element: (
            <UnauthorizedRoute>
              <PageLifeEventsWrapper />
            </UnauthorizedRoute>
          )
        },
        {
          path: '/user/task',
          element: (
            <UnauthorizedRoute>
              <TaskList />
            </UnauthorizedRoute>
          )
        },
        {
          path: '/user/task-workspace',
          element: (
            <UnauthorizedRoute>
              <TaskWorkspaceCrud />
            </UnauthorizedRoute>
          )
        },
        // 
        {
          path: "/user/quick-memo-ai",
          element: (
            <UnauthorizedRoute>
              <MemoQuickAi />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/notes",
          element: (
            <UnauthorizedRoute>
              <NotesWrapper />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/notes-workspace",
          element: (
            <UnauthorizedRoute>
              <NotesWorkspaceCrud />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/info-vault",
          element: (
            <UnauthorizedRoute>
              <InfoVaultWrapper />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/calender",
          element: (
            <UnauthorizedRoute>
              <CalendarWrapper />
            </UnauthorizedRoute>
          ),
        },

        // -----

        {
          path: "/user/finance",
          element: (
            <UnauthorizedRoute>
              <FinanceWrapper />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/ai-deep-search",
          element: (
            <UnauthorizedRoute>
              <AiDeepResearchWrapper />
            </UnauthorizedRoute>
          ),
        },

        // -----

        {
          path: "/user/setting",
          element: (
            <UnauthorizedRoute>
              <Setting />
            </UnauthorizedRoute>
          ),
        },

        // -----

        {
          path: "/about",
          element: (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <About />
            </Suspense>
          ),
        },

        // -----

        {
          path: '/test',
          element:  (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <TestDevWrapper />
            </Suspense>
          )
        }
      ]
    },
  ], {

  });

  return (
    <>
      <Toaster
        position="top-center"
      />
      <RouterProvider router={router} />
      <RefreshToken />
      <LlmTaskBackgroundProcess />

      {/* dynamic data */}
      <ModelOpenrouterInsertAll />
    </>
  )
}

export default App;
