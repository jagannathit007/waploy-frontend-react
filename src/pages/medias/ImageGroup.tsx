import { Message } from '../OtherPage/Chats';

const ImageGroup = ({ messages }: { messages: Message[] }) => {
  const isMe = messages[0].from === 'me';
  const hasMore = messages.length > 4;
  const displayMessages = messages.slice(0, 4);

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs rounded-lg overflow-hidden`}>
        {messages.length === 1 ? (
          <div className="relative">
            <img src={messages[0].content} alt="Image" className="max-w-xs rounded-lg" />
            <span className="text-xs text-gray-500 absolute bottom-1 right-1 bg-black bg-opacity-50 px-1 rounded">{messages[0].time}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {displayMessages.map((msg, idx) => (
              <div key={msg.id} className="relative">
                <img src={msg.content} alt="Image" className="w-full h-auto object-cover" />
                {hasMore && idx === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold">
                    +{messages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500 block text-right px-2 py-1">{messages[messages.length - 1].time}</span>
      </div>
    </div>
  );
};

export default ImageGroup;