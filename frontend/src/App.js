import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedComponents from './components/protectComponent';
import { publicRoutes } from './routes/routes';

function App() {
    return (
        <Router>
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
