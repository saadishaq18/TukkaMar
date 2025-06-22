import React, {useState} from 'react'
import socket from '../socket'

function ChatBox({roomId}) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState([])

    socket.on('chat_message', (msg)=> {
        setMessages((prev)=>[...prev, msg])
    })

    const sendMessage = () => {
        socket.emit('chat_message', {roomId, guess: input})
        setInput('')
    }
  return (
    <div className="mt-4">
      <div className="h-40 overflow-y-scroll bg-gray-100 p-2 mb-2 border">
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.sender}: </strong>{m.message}
          </div>
        ))}
      </div>
      <input
        className="border p-2 w-full"
        placeholder="Guess here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
    </div>
  )
}

export default ChatBox