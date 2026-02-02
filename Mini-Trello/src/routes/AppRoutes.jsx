import { Routes, Route, Navigate } from "react-router-dom";
import Login from "~/pages/Auth/Login";
import Register from "~/pages/Auth/Register";
import Settings from "~/pages/Auth/Settings";
import BoardsList from "~/pages/Boards/BoardsList";
import Boards from "~/pages/Boards";
import RequireAuth from "~/components/RequireAuth";
import SessionSyncListener from "~/components/SessionSyncListener";

export default function AppRoutes() {
  return (
    <SessionSyncListener>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <BoardsList />
            </RequireAuth>
          }
        />

        <Route
          path="/board/:boardId"
          element={
            <RequireAuth>
              <Boards />
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </SessionSyncListener>
  );
}
