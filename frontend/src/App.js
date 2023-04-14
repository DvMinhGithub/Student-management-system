import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { publicRoutes } from './routes/routes';
import ProtectedComponents from './components/protectComponent';

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
