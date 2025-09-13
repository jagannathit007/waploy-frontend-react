// import { Message } from '../OtherPage/Chats';

const AudioMessage = ({ msg, isMe }: { msg: any; isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
    <div className={`max-w-xs rounded-lg ${isMe ? 'bg-green-100' : 'bg-gray-100'} p-2 flex items-center`}>
      <button className="mr-2">
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <div className="flex-1 flex items-end space-x-0.5 h-5">
        {[3, 5, 7, 10, 8, 6, 9, 12, 10, 8, 6, 4, 7, 9, 5].map((h, i) => (
          <div key={i} className="bg-gray-500 w-1" style={{ height: `${h}px` }} />
        ))}
      </div>
      <span className="ml-2 text-sm text-gray-500">{msg.meta?.duration || '0:00'}</span>
      <svg className="ml-2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>
  </div>
);

export default AudioMessage;