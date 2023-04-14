import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { publicRoutes } from './routes/routes';

function App() {
    return (
        <Router>
            <Routes>
                {publicRoutes.map((route, index) => {
                    return <Route path={route.path} key={index} element={route.element} />;
                })}
            </Routes>
        </Router>
    );
}

export default App;
