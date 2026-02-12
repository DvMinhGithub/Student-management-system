import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <ConfigProvider
        theme={{
            token: {
                colorPrimary: '#0ea5a6',
                colorBgLayout: '#f4f6f8',
                colorBgContainer: '#ffffff',
                colorText: '#0f172a',
                colorTextSecondary: '#64748b',
                borderRadius: 12,
                fontFamily: "'Sora', 'Space Grotesk', system-ui, -apple-system, sans-serif"
            },
            components: {
                Layout: {
                    headerHeight: "auto",
                },
            },
        }}>
        <App />
    </ConfigProvider>,
    // </React.StrictMode>
);
