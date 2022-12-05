import React from 'react'
import ReactDOM from 'react-dom/client'
import DemoPage from './components/pages/demo'
import './sass/index.scss' 

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DemoPage />
  </React.StrictMode>
)
