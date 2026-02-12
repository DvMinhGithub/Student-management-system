import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedComponents from './components/ProtectedComponents';
import { publicRoutes } from './routes';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ProtectedComponents>
                <Routes>
                    {publicRoutes.map((route, index) => {
                        return <Route path={route.path} key={index} element={route.element} />;
                    })}
                </Routes>
            </ProtectedComponents>
        </Router>
    );
}

export default App;
