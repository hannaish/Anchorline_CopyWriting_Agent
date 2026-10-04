import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Blocked from './Blocked'
import '../../styles/tailwind.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <Blocked />
  </StrictMode>,
)
