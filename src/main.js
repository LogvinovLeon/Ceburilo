import React from 'react'
import App from './components/App';
React.render(
    <App/>,
    document.getElementById('app')
);
if (typeof window !== 'undefined') {
    window.React = React;
}