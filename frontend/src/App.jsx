import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Layout from './components/Layout';
import Home from './pages/Home';
import Mission from './pages/Mission';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import { useAuth } from './context/AuthContext';

const ProtectedRoutes = () => {
  const { user } = useAuth();
  return user ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/welcome" />
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" /> : <Welcome />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/welcome" />} />
    </Routes>
  );
};


function App() {
  return (
    <>
      <GlobalStyle />
      <AppRoutes />
    </>
  );
}

export default App;