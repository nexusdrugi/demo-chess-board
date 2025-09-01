import React from 'react'
import ChessGame from './components/ChessGame'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Modern Chess Game
        </h1>
        <ChessGame />
      </div>
    </div>
  )
}

export default App