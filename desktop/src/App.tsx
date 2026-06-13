import React, { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

interface Quest {
  id: string
  title: string
  daysAgo: number
}

interface Project {
  name: string
  quests: Quest[]
}

const App: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      name: 'go-fly',
      quests: [
        { id: '1', title: 'spec 位置查询', daysAgo: 2 },
        { id: '2', title: '项目总结', daysAgo: 2 },
        { id: '3', title: '项目总结', daysAgo: 2 },
      ],
    },
  ])

  const [selectedProject] = useState('go-fly')
  const [selectedBranch] = useState('main')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <TitleBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar projects={projects} />
        <MainContent
          projectName={selectedProject}
          branch={selectedBranch}
        />
      </div>
    </div>
  )
}

export default App
