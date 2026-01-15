import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

interface PublicLayoutProps {
    children: React.ReactNode;
    transparentNavbar?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, transparentNavbar = false }) => {
    return (
        <div className="font-sans text-gray-800 overflow-x-hidden bg-white">
            <PublicNavbar transparentOnTop={transparentNavbar} />
            <main>
                {children}
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
