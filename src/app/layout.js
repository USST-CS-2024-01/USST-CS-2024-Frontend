import './globals.css'
import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';

const inter = Inter({ subsets: ['latin'] })

const RootLayout = ({ children }) => (
    <html lang="en">
        <body className={inter.className}>
            <AntdRegistry>{children}</AntdRegistry>
        </body>
    </html>
);

export default RootLayout;
