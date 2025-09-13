// import { Message } from '../OtherPage/Chats';

const TextMessage = ({ msg, isMe }: { msg: any; isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
    <div className={`max-w-xs px-4 py-2 rounded-lg ${isMe ? 'bg-green-100 text-right' : 'bg-gray-100 text-left'}`}>
      {msg.isForwarded && <span className="text-xs text-gray-500 block mb-1">Forwarded</span>}
      <p>{msg.content}</p>
      <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
    </div>
  </div>
);

export default TextMessage;