import React from 'react'

function WordPicker({options, onSelect}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded text-center">
        <h2 className="text-xl mb-4">Choose a word to draw:</h2>
        <div className="flex gap-4">
          {options.map((word, i) => (
            <button
              key={i}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => onSelect(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WordPicker