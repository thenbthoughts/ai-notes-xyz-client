import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';

// component
import Header from './components/Header';
import NavigationDrawer from './components/NavigationDrawer.tsx';
import UnauthorizedRoute from "./components/UnauthorizedRoute.tsx";
import RefreshToken from "./components/RefreshToken.tsx";
import AuthorizedRoute from "./components/AuthorizedRoute.tsx";

// pages -> auth
const UserLogin = lazy(() => import('./pages/user/auth/Login.tsx'));
const UserRegister = lazy(() => import('./pages/user/auth/Register.tsx'));
const UserLogout = lazy(() => import('./pages/user/auth/Logout.tsx'));

// pages -> other
const About = lazy(() => import("./pages/other/About.tsx"));
const UserHomepage = lazy(() => import("./pages/user/userhomepage/UserHomepage.tsx"));

// pages -> setting
const SettingProfile = lazy(() => import("./pages/user/settings/settingProfile/SettingProfile.tsx"));
const SettingApiKey = lazy(() => import("./pages/user/settings/settingApiKeys/SettingApiKey.tsx"));
const SettingModelPreference = lazy(() => import("./pages/user/settings/settingModelPreference/SettingModelPreference.tsx"));
const LoginHistory = lazy(() => import("./pages/user/settings/loginHistory/loginHistory.tsx"));
const SettingChangePassword = lazy(() => import("./pages/user/settings/changePassword/SettingChangePassword.tsx"));
const NotificationWrapper = lazy(() => import("./pages/user/settings/notification/NotificationWrapper.tsx"));

// pages -> ai
const ChatLlmListWrapper = lazy(() => import('./pages/user/noteAdvance/ChatLlmList/ChatLlmListWrapper.tsx'));
const AiDeepResearchWrapper = lazy(() => import("./pages/user/noteAdvance/AiDeepResearch/AiDeepResearchWrapper.tsx"));

// pages -> notes
const NotesWrapper = lazy(() => import("./pages/user/noteAdvance/Notes/NotesWrapper.tsx"));
const NotesWorkspaceCrud = lazy(() => import("./pages/user/noteAdvance/NotesWorkspaceCrud/NotesWorkspaceCrud.tsx"));
const InfoVaultWrapper = lazy(() => import("./pages/user/noteAdvance/InfoVault/InfoVaultWrapper.tsx"));
const LifeEventWrapper = lazy(() => import('./pages/user/noteAdvance/LifeEventsList/LifeEventWrapper.tsx'));

// pages -> productivity
const TaskList = lazy(() => import("./pages/user/noteAdvance/taskList/TaskList.tsx"));
const TaskWorkspaceCrud = lazy(() => import("./pages/user/noteAdvance/TaskWorkspaceCrud/TaskWorkspaceCrud.tsx"));
const CalendarWrapper = lazy(() => import("./pages/user/noteAdvance/Calendar/CalendarWrapper.tsx"));
const FinanceWrapper = lazy(() => import("./pages/user/noteAdvance/Finance/FinanceWrapper.tsx"));
const TaskScheduleWrapper = lazy(() => import("./pages/user/noteAdvance/taskSchedule/TaskScheduleWrapper.tsx"));

// pages -> test
const TestDevWrapper = lazy(() => import("./pages/test/testDev/TestDevWrapper.tsx"));
const TestUserHomepageBackupDelete = lazy(() => import("./pages/user/userhomepage/backup-delete/UserHomepage-backup-delete.tsx"));

// components -> settings
const ModelOpenrouterInsertAll = lazy(() => import('./components/settings/ModelOpenrouterInsertAll.tsx'));
const UpdateUserApiClientFrontendUrl = lazy(() => import('./components/settings/UpdateUserApiClientFrontendUrl.tsx'));

// pages -> maps
const MapsWrapper = lazy(() => import("./pages/user/noteAdvance/Maps/Maps.tsx"));

// pages -> suggestions
const AiSuggestions = lazy(() => import("./pages/user/noteAdvance/Suggestions/AiSuggestions.tsx"));
const AiSuggestionsDemo = lazy(() => import("./pages/user/noteAdvance/Suggestions/demo/AiSuggestions.tsx"));

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
          path: '/user/chat',
          element: (
            <UnauthorizedRoute>
              <ChatLlmListWrapper />
            </UnauthorizedRoute>
          )
        },
        {
          path: '/user/life-events',
          element: (
            <UnauthorizedRoute>
              <LifeEventWrapper />
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
        {
          path: "/user/task-schedule",
          element: (
            <UnauthorizedRoute>
              <TaskScheduleWrapper />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/suggestions",
          element: (
            <UnauthorizedRoute>
              <AiSuggestions />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/ai-suggestions-demo",
          element: (
            <UnauthorizedRoute>
              <AiSuggestionsDemo />
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
              <SettingProfile />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/setting/api-key",
          element: (
            <UnauthorizedRoute>
              <SettingApiKey />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/setting/model-preference",
          element: (
            <UnauthorizedRoute>
              <SettingModelPreference />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/setting/login-history",
          element: (
            <UnauthorizedRoute>
              <LoginHistory />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/setting/change-password",
          element: (
            <UnauthorizedRoute>
              <SettingChangePassword />
            </UnauthorizedRoute>
          ),
        },
        {
          path: "/user/setting/notification",
          element: (
            <UnauthorizedRoute>
              <NotificationWrapper />
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
          element: (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <TestDevWrapper />
            </Suspense>
          )
        },
        {
          path: '/test/homepage-backup-delete',
          element: (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <TestUserHomepageBackupDelete />
            </Suspense>
          )
        },
        {
          path: '/user/maps',
          element: (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <MapsWrapper />
            </Suspense>
          )
        }
      ]
    },
  ], {

  });

  return (
    <HelmetProvider>
      <Helmet>
        <link rel="icon" href="/logoAiNotesXyz.png" />
        <link rel="alternate icon" href="/logoAiNotesXyz.png" />
      </Helmet>
      <Toaster
        position="top-center"
      />
      <RouterProvider router={router} />
      <RefreshToken />

      {/* dynamic data */}
      <ModelOpenrouterInsertAll />
      <UpdateUserApiClientFrontendUrl />
    </HelmetProvider>
  )
}

export default App;
