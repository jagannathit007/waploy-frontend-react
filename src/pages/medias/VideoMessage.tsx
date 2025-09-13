import { Message } from '../OtherPage/Chats';

const VideoMessage = ({ msg, isMe }: { msg: Message; isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
    <div className={`max-w-xs rounded-lg ${isMe ? 'bg-green-100' : 'bg-gray-100'}`}>
      <video src={msg.content} controls className="max-w-xs rounded-lg" />
      <span className="text-xs text-gray-500 ml-2 px-4 py-1 block text-right">{msg.time}</span>
    </div>
  </div>
);

export default VideoMessage;